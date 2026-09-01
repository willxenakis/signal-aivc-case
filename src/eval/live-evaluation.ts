import { syntheticCompanies } from "@/data/companies";
import { syntheticEnquiries } from "@/data/enquiries";
import {
  SYNTHETIC_DATASET_PROVENANCE,
  syntheticGoldLabels,
  type GoldLabel,
} from "@/data/gold-labels";
import type { EvidenceClassifier } from "@/domain/classifier";
import {
  evaluatePredictions,
  type EvaluationMetrics,
} from "@/domain/evaluation";
import { validateEvidencePackage } from "@/domain/evidence";
import { triageEnquiry } from "@/domain/pipeline";
import { applyRoutingPolicy } from "@/domain/routing";
import {
  InMemoryCompanyResearchProvider,
  type CompanyResearchProvider,
} from "@/domain/research";
import type {
  DecisionPackage,
  Enquiry,
  ReviewPolicy,
  ServiceLine,
} from "@/domain/schemas";
import type {
  EvaluationSplit,
  LiveEvalProvider,
} from "@/eval/cli-options";
import {
  auditEvaluationDataset,
  type DatasetQualityAudit,
} from "@/eval/dataset-quality";

type SuccessfulEvaluationCase = {
  status: "success";
  enquiryId: string;
  companyName: string;
  expectedServiceLine: ServiceLine;
  predictedServiceLine: ServiceLine;
  correct: boolean;
  expectedComplexity: GoldLabel["expectedComplexity"];
  predictedComplexity: GoldLabel["expectedComplexity"];
  complexityCorrect: boolean;
  expectedReview: boolean;
  predictedReview: boolean;
  evidenceValidationErrors: string[];
  decision: DecisionPackage;
};

type FailedEvaluationCase = {
  status: "error";
  enquiryId: string;
  companyName: string;
  expectedServiceLine: ServiceLine;
  expectedComplexity: GoldLabel["expectedComplexity"];
  expectedReview: boolean;
  error: {
    category:
      | "authentication"
      | "budget"
      | "rate_limit"
      | "timeout"
      | "structured_output"
      | "provider";
    name: string;
    message: string;
  };
};

export type LiveEvaluationCase =
  | SuccessfulEvaluationCase
  | FailedEvaluationCase;

export type LiveEvaluationReport = {
  schemaVersion: "1.0";
  generatedAt: string;
  durationMs: number;
  config: {
    datasetName: string;
    provider: LiveEvalProvider;
    model: string;
    split: EvaluationSplit;
    reviewPolicy: ReviewPolicy;
    limit: number | null;
    caseIds: string[];
    fallbackEnabled: false;
  };
  datasetQuality: DatasetQualityAudit;
  summary: {
    attempted: number;
    succeeded: number;
    failed: number;
    providerSuccessRate: number;
    endToEndClassificationAccuracy: number;
    endToEndComplexityAccuracy: number;
    complexityAccuracyAmongSuccesses: number;
    successfulCaseMetrics: EvaluationMetrics;
    policyComparison: Record<ReviewPolicy, EvaluationMetrics>;
    evidenceValidityAmongSuccesses: number;
    endToEndEvidenceValidity: number;
    latency: { averageMs: number; p95Ms: number };
    tokens: { input: number; output: number; total: number };
  };
  cases: LiveEvaluationCase[];
};

export type LiveEvaluationProgress = {
  index: number;
  total: number;
  enquiryId: string;
  status: "success" | "error";
};

type RunLiveEvaluationOptions = {
  classifier: EvidenceClassifier;
  provider: LiveEvalProvider;
  model: string;
  split: EvaluationSplit;
  reviewPolicy: ReviewPolicy;
  limit?: number | null;
  caseIds?: string[];
  redactSecrets?: string[];
  generatedAt?: string;
  onProgress?: (progress: LiveEvaluationProgress) => void;
};

export type LiveEvaluationDataset = {
  name: string;
  enquiries: Enquiry[];
  labels: GoldLabel[];
  researchProvider: CompanyResearchProvider;
  quality: DatasetQualityAudit;
};

function ratio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percentile95(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];
}

export function redactSensitiveText(value: string, secrets: string[]) {
  let result = value;
  for (const secret of secrets.filter(Boolean)) {
    result = result.replaceAll(secret, "[REDACTED]");
  }
  return result
    .replaceAll(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]")
    .replaceAll(/\b(?:vck|vcg)_[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]");
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  return null;
}

function serializeError(error: unknown, secrets: string[]) {
  const name = error instanceof Error ? error.name : "Error";
  const message = redactSensitiveText(
    error instanceof Error ? error.message : String(error),
    secrets,
  );
  const status = errorStatus(error);
  const searchable = `${name} ${message}`.toLowerCase();
  const category =
    status === 401 ||
    status === 403 ||
    searchable.includes("authentication") ||
    searchable.includes("credential") ||
    searchable.includes("api key")
      ? "authentication"
      : status === 402 || searchable.includes("budget")
        ? "budget"
        : status === 429 || searchable.includes("rate limit")
          ? "rate_limit"
          : searchable.includes("timeout") || searchable.includes("timed out")
            ? "timeout"
            : searchable.includes("nooutput") ||
                searchable.includes("no object") ||
                searchable.includes("structured output") ||
                searchable.includes("schema")
              ? "structured_output"
              : "provider";

  return { category, name, message } as FailedEvaluationCase["error"];
}

export function selectEvaluationGoldLabels(
  labels: GoldLabel[],
  split: EvaluationSplit,
  caseIds: string[] = [],
  limit: number | null = null,
) {
  const requested = new Set(caseIds);
  const selected = labels.filter(
    (label) =>
      (split === "all" || label.split === split) &&
      (requested.size === 0 || requested.has(label.enquiryId)),
  );
  const selectedIds = new Set(selected.map((label) => label.enquiryId));
  const missing = caseIds.filter((id) => !selectedIds.has(id));
  if (missing.length > 0) {
    throw new Error(
      `Unknown cases for the ${split} split: ${missing.join(", ")}`,
    );
  }
  return limit === null ? selected : selected.slice(0, limit);
}

export function selectSyntheticGoldLabels(
  split: EvaluationSplit,
  caseIds: string[] = [],
  limit: number | null = null,
) {
  return selectEvaluationGoldLabels(
    syntheticGoldLabels,
    split,
    caseIds,
    limit,
  );
}

function findEnquiry(enquiries: Enquiry[], label: GoldLabel) {
  const enquiry = enquiries.find((item) => item.id === label.enquiryId);
  if (!enquiry) throw new Error(`Missing enquiry ${label.enquiryId}`);
  return enquiry;
}

export async function runLiveEvaluationDataset(
  options: RunLiveEvaluationOptions & { dataset: LiveEvaluationDataset },
): Promise<LiveEvaluationReport> {
  const startedAt = performance.now();
  const labels = selectEvaluationGoldLabels(
    options.dataset.labels,
    options.split,
    options.caseIds,
    options.limit,
  );
  const cases: LiveEvaluationCase[] = [];
  const secrets = options.redactSecrets ?? [];

  for (const [index, label] of labels.entries()) {
    const enquiry = findEnquiry(options.dataset.enquiries, label);
    try {
      const decision = await triageEnquiry({
        enquiry,
        researchProvider: options.dataset.researchProvider,
        classifier: options.classifier,
        reviewPolicy: options.reviewPolicy,
      });
      const evidenceValidationErrors = validateEvidencePackage(decision);
      cases.push({
        status: "success",
        enquiryId: enquiry.id,
        companyName: enquiry.companyName,
        expectedServiceLine: label.expectedServiceLine,
        predictedServiceLine: decision.classification.primaryServiceLine,
        correct:
          label.expectedServiceLine ===
          decision.classification.primaryServiceLine,
        expectedComplexity: label.expectedComplexity,
        predictedComplexity: decision.classification.complexity,
        complexityCorrect:
          label.expectedComplexity === decision.classification.complexity,
        expectedReview: label.expectedReview,
        predictedReview: decision.route.status === "needs_review",
        evidenceValidationErrors,
        decision,
      });
      options.onProgress?.({
        index: index + 1,
        total: labels.length,
        enquiryId: enquiry.id,
        status: "success",
      });
    } catch (error) {
      cases.push({
        status: "error",
        enquiryId: enquiry.id,
        companyName: enquiry.companyName,
        expectedServiceLine: label.expectedServiceLine,
        expectedComplexity: label.expectedComplexity,
        expectedReview: label.expectedReview,
        error: serializeError(error, secrets),
      });
      options.onProgress?.({
        index: index + 1,
        total: labels.length,
        enquiryId: enquiry.id,
        status: "error",
      });
    }
  }

  const successfulCases = cases.filter(
    (item): item is SuccessfulEvaluationCase => item.status === "success",
  );
  const successfulCaseMetrics = evaluatePredictions(
    successfulCases.map((item) => ({
      expectedServiceLine: item.expectedServiceLine,
      predictedServiceLine: item.predictedServiceLine,
      expectedReview: item.expectedReview,
      predictedReview: item.predictedReview,
    })),
  );
  const policyComparison = Object.fromEntries(
    (["conservative", "balanced", "aggressive"] as const).map((policy) => [
      policy,
      evaluatePredictions(
        successfulCases.map((item) => ({
          expectedServiceLine: item.expectedServiceLine,
          predictedServiceLine: item.predictedServiceLine,
          expectedReview: item.expectedReview,
          predictedReview:
            applyRoutingPolicy(item.decision, policy).status === "needs_review",
        })),
      ),
    ]),
  ) as Record<ReviewPolicy, EvaluationMetrics>;
  const validEvidence = successfulCases.filter(
    (item) => item.evidenceValidationErrors.length === 0,
  ).length;
  const correctComplexity = successfulCases.filter(
    (item) => item.complexityCorrect,
  ).length;
  const latencies = successfulCases.map(
    (item) => item.decision.provenance.latencyMs,
  );
  const inputTokens = successfulCases.reduce(
    (total, item) =>
      total + (item.decision.provenance.tokenUsage?.input ?? 0),
    0,
  );
  const outputTokens = successfulCases.reduce(
    (total, item) =>
      total + (item.decision.provenance.tokenUsage?.output ?? 0),
    0,
  );

  return {
    schemaVersion: "1.0",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
    config: {
      datasetName: options.dataset.name,
      provider: options.provider,
      model: options.model,
      split: options.split,
      reviewPolicy: options.reviewPolicy,
      limit: options.limit ?? null,
      caseIds: options.caseIds ?? [],
      fallbackEnabled: false,
    },
    datasetQuality: options.dataset.quality,
    summary: {
      attempted: cases.length,
      succeeded: successfulCases.length,
      failed: cases.length - successfulCases.length,
      providerSuccessRate: ratio(successfulCases.length, cases.length),
      endToEndClassificationAccuracy: ratio(
        successfulCaseMetrics.correct,
        cases.length,
      ),
      endToEndComplexityAccuracy: ratio(correctComplexity, cases.length),
      complexityAccuracyAmongSuccesses: ratio(
        correctComplexity,
        successfulCases.length,
      ),
      successfulCaseMetrics,
      policyComparison,
      evidenceValidityAmongSuccesses: ratio(
        validEvidence,
        successfulCases.length,
      ),
      endToEndEvidenceValidity: ratio(validEvidence, cases.length),
      latency: {
        averageMs: ratio(
          latencies.reduce((total, value) => total + value, 0),
          latencies.length,
        ),
        p95Ms: percentile95(latencies),
      },
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
    },
    cases,
  };
}

function syntheticLiveEvaluationDataset(): LiveEvaluationDataset {
  return {
    name: "Project-authored synthetic development portfolio",
    enquiries: syntheticEnquiries,
    labels: syntheticGoldLabels,
    researchProvider: new InMemoryCompanyResearchProvider(syntheticCompanies),
    quality: auditEvaluationDataset({
      enquiries: syntheticEnquiries,
      labels: syntheticGoldLabels,
      provenance: SYNTHETIC_DATASET_PROVENANCE,
    }),
  };
}

export async function runSyntheticLiveEvaluation(
  options: RunLiveEvaluationOptions,
): Promise<LiveEvaluationReport> {
  return runLiveEvaluationDataset({
    ...options,
    dataset: syntheticLiveEvaluationDataset(),
  });
}
