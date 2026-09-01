import type {
  Classification,
  CompanyDossier,
  Enquiry,
  EvidenceItem,
  ServiceLine,
} from "@/domain/schemas";

export type ClassificationResult = {
  classification: Classification;
  evidence: EvidenceItem[];
  provenance: {
    mode: "synthetic_baseline" | "live_ai" | "fallback";
    provider: string;
    model: string;
    latencyMs: number;
    tokenUsage: { input: number; output: number } | null;
  };
};

export interface EvidenceClassifier {
  classify(
    enquiry: Enquiry,
    company: CompanyDossier,
  ): Promise<ClassificationResult>;
}

type ErrorDetails = {
  name: string;
  message: string;
  statusCode?: number;
  code?: string;
};

function redactErrorMessage(message: string) {
  return message
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[REDACTED_KEY]")
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[REDACTED_EMAIL]",
    )
    .replace(
      /(api[_-]?key|authorization|token)(\s*[:=]\s*)[^\s,;]+/gi,
      "$1$2[REDACTED]",
    )
    .replace(/\s+/g, " ")
    .slice(0, 300);
}

function sanitizeClassifierError(error: unknown): ErrorDetails {
  const fallback: ErrorDetails = {
    name: "UnknownError",
    message: "Unknown classifier failure",
  };
  if (!(error instanceof Error)) return fallback;

  const details: ErrorDetails = {
    name: error.name || "Error",
    message: redactErrorMessage(error.message || "Classifier failure"),
  };

  let candidate: unknown = error;
  for (let depth = 0; depth < 3 && candidate; depth += 1) {
    if (typeof candidate !== "object") break;
    const record = candidate as Record<string, unknown>;
    if (details.statusCode === undefined && typeof record.statusCode === "number") {
      details.statusCode = record.statusCode;
    }
    if (
      details.code === undefined &&
      typeof record.code === "string" &&
      /^[A-Za-z0-9_.-]{1,80}$/.test(record.code)
    ) {
      details.code = record.code;
    }
    candidate = record.cause;
  }

  return details;
}

export class ResilientEvidenceClassifier implements EvidenceClassifier {
  constructor(
    private readonly primary: EvidenceClassifier,
    private readonly fallback: EvidenceClassifier,
  ) {}

  async classify(
    enquiry: Enquiry,
    company: CompanyDossier,
  ): Promise<ClassificationResult> {
    try {
      return await this.primary.classify(enquiry, company);
    } catch (error) {
      console.error(
        "[triage] primary classifier failed; using fallback",
        sanitizeClassifierError(error),
      );
      const result = await this.fallback.classify(enquiry, company);
      return {
        ...result,
        classification: {
          ...result.classification,
          requestedReview: true,
          reviewReasons: [
            ...new Set([
              ...result.classification.reviewReasons,
              "ai_provider_error",
            ]),
          ],
        },
        provenance: {
          ...result.provenance,
          mode: "fallback",
        },
      };
    }
  }
}

const KEYWORDS: Record<ServiceLine, string[]> = {
  ai_strategy_value: [
    "strategy",
    "roadmap",
    "prioritize",
    "portfolio assessment",
    "business case",
    "highest-value",
    "strongest ai opportunities",
  ],
  data_ai_platforms: [
    "data platform",
    "data foundation",
    "data model",
    "data layer",
    "knowledge layer",
    "unify",
    "connect asset",
    "identity-resolved",
    "permission-aware knowledge",
    "canonical shipment",
    "shared network",
  ],
  ai_applications_automation: [
    "copilot",
    "assistant",
    "agent",
    "drafts",
    "draft ",
    "summarizes",
    "summarize",
    "answers questions",
  ],
  decision_intelligence_operations: [
    "predict",
    "forecast",
    "optimize",
    "optimization",
    "scheduling",
    "schedule",
    "anomaly detection",
    "prioritize them",
    "allocation",
    "replenishment",
    "dispatch",
  ],
  ai_governance_risk_security: [
    "governance",
    "privacy",
    "model risk",
    "controls",
    "fairness",
    "explainability",
    "cybersecurity",
    "responsible",
    "acceptable-use",
    "validation",
    "audit",
  ],
  adoption_operating_model: [
    "adoption",
    "training program",
    "operating model",
    "role-based training",
    "ways of working",
    "workforce redesign",
  ],
};

const USE_CASES: Array<[string[], string]> = [
  [["maintenance", "equipment"], "predictive_maintenance"],
  [["claims", "review"], "claims_review"],
  [["fraud", "suspicious", "aml"], "fraud_detection"],
  [["customer support", "contact-center", "contact center"], "customer_service_agent"],
  [["supply chain", "inventory", "replenishment"], "supply_chain_optimization"],
  [["schedule", "scheduling", "dispatch"], "workforce_scheduling"],
  [["copilot", "assistant", "agent"], "knowledge_copilot"],
  [["data platform", "data foundation", "data layer", "data model"], "data_foundation"],
  [["governance", "risk", "controls", "privacy"], "ai_governance"],
  [["strategy", "roadmap", "prioritize"], "ai_strategy"],
];

function scoreServiceLines(text: string) {
  return (Object.entries(KEYWORDS) as Array<[ServiceLine, string[]]>)
    .map(([serviceLine, keywords]) => ({
      serviceLine,
      score: keywords.reduce(
        (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

function inferUseCase(text: string) {
  let best: { name: string; score: number } = { name: "enterprise_ai", score: 0 };
  for (const [keywords, name] of USE_CASES) {
    const score = keywords.reduce(
      (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > best.score) best = { name, score };
  }
  return best.name;
}

function inferComplexity(
  primary: ServiceLine,
  enquiry: Enquiry,
): Classification["complexity"] {
  const text = enquiry.description.toLowerCase();
  if (primary === "data_ai_platforms" || primary === "decision_intelligence_operations") {
    return "complex";
  }
  if (
    text.includes("across several legacy") ||
    text.includes("regulated submissions") ||
    text.includes("enterprise-wide")
  ) {
    return "complex";
  }
  if (primary === "ai_strategy_value") return "simple";
  return "moderate";
}

export class LocalEvidenceClassifier implements EvidenceClassifier {
  async classify(
    enquiry: Enquiry,
    company: CompanyDossier,
  ): Promise<ClassificationResult> {
    const startedAt = performance.now();
    const text = enquiry.description.toLowerCase();
    const scored = scoreServiceLines(text);
    const primary = scored[0].score > 0 ? scored[0].serviceLine : "ai_strategy_value";
    const secondary =
      scored[1].score > 0 && scored[0].score - scored[1].score <= 1
        ? scored[1].serviceLine
        : null;
    const complexity = inferComplexity(primary, enquiry);
    const useCase = inferUseCase(text);
    const ambiguous = scored[0].score === 0 || scored[0].score === scored[1].score;
    const requestedReview = ambiguous;

    const intakeEvidence: EvidenceItem = {
      id: `EV-${enquiry.id}-INTAKE`,
      sourceType: "intake",
      sourceRef: "enquiry.description",
      excerpt: enquiry.description,
      supports: ["service_line", "use_case", "complexity", "urgency"],
      importance: "decisive",
    };
    const evidence: EvidenceItem[] = [intakeEvidence];
    if (company.sources[0]) {
      evidence.push({
        id: `EV-${enquiry.id}-COMPANY`,
        sourceType: "company_research",
        sourceRef: company.sources[0].id,
        excerpt: company.sources[0].excerpt,
        supports: ["company_identity", "complexity"],
        importance: "contextual",
      });
    }

    return {
      classification: {
        summary: enquiry.description.replace(/\s+/g, " ").trim(),
        primaryServiceLine: primary,
        secondaryServiceLine: secondary,
        complexity,
        useCase,
        decisionFactors: [
          {
            label: `Client language matched the ${primary} service rubric`,
            importance: "decisive",
            evidenceIds: [intakeEvidence.id],
          },
          ...(company.sources[0]
            ? [
                {
                  label: "Verified company context informs delivery complexity",
                  importance: "contextual" as const,
                  evidenceIds: [`EV-${enquiry.id}-COMPANY`],
                },
              ]
            : []),
        ],
        missingInformation:
          enquiry.description.length < 60
            ? ["The enquiry does not include enough implementation detail."]
            : [],
        alternatives: secondary
          ? [
              {
                serviceLine: secondary,
                reason: "The intake contains language associated with both service rubrics.",
              },
            ]
          : [],
        requestedReview,
        reviewReasons: [
          ...(ambiguous ? ["ambiguous_service_line"] : []),
        ],
      },
      evidence,
      provenance: {
        mode: "synthetic_baseline",
        provider: "local",
        model: "evidence-rules-v1",
        latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
        tokenUsage: null,
      },
    };
  }
}
