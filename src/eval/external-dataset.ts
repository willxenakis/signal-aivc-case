import { z } from "zod";

import type {
  EvaluationDatasetProvenance,
  GoldLabel,
} from "@/data/gold-labels";
import type { CompanyResearchProvider } from "@/domain/research";
import {
  INDUSTRIES,
  SERVICE_LINES,
  type CompanyDossier,
  type Enquiry,
} from "@/domain/schemas";
import { auditEvaluationDataset } from "@/eval/dataset-quality";

const externalEvaluationDatasetSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    metadata: z.object({
      name: z.string().min(3),
      kind: z.enum(["synthetic", "historical"]),
      purpose: z.enum(["development", "blind_evaluation"]),
      generatedBy: z.string().min(3),
      labeledBy: z.string().min(3),
      independentLabels: z.boolean(),
      frozenAt: z.string().datetime().nullable(),
    }),
    cases: z
      .array(
        z.object({
          id: z.string().min(1),
          intake: z.object({
            description: z.string().min(20),
            industry: z.enum(INDUSTRIES),
            companySize: z.enum([
              "1-50",
              "51-250",
              "251-1000",
              "1001-5000",
              "5000+",
            ]),
            urgency: z.enum(["low", "standard", "high", "critical"]),
          }),
          expected: z.object({
            serviceLine: z.enum(SERVICE_LINES),
            complexity: z.enum(["simple", "moderate", "complex"]),
            useCase: z.string().min(2),
            reviewRequired: z.boolean(),
          }),
        }),
      )
      .min(1),
  })
  .superRefine((dataset, context) => {
    const ids = dataset.cases.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Evaluation datasets must contain unique case IDs.",
        path: ["cases"],
      });
    }
  });

export type ExternalEvaluationDataset = z.infer<
  typeof externalEvaluationDatasetSchema
>;

class IntakeOnlyResearchProvider implements CompanyResearchProvider {
  constructor(private readonly dossiers: Map<string, CompanyDossier>) {}

  async research(enquiry: Enquiry) {
    return {
      status: "skipped" as const,
      dossier: this.dossiers.get(enquiry.id) ?? null,
      reason: null,
    };
  }
}

function safeSlug(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-");
}

export function parseExternalEvaluationDataset(value: unknown) {
  return externalEvaluationDatasetSchema.parse(value);
}

export function toLiveEvaluationDataset(dataset: ExternalEvaluationDataset) {
  const submittedAt =
    dataset.metadata.frozenAt ?? "2026-01-01T00:00:00.000Z";
  const dossiers = new Map<string, CompanyDossier>();
  const enquiries: Enquiry[] = dataset.cases.map((item) => {
    const domain = `${safeSlug(item.id)}.evaluation.invalid`;
    dossiers.set(item.id, {
      id: `COMPANY-${item.id}`,
      name: "Company identity not supplied",
      domain,
      identityConfidence: "partial",
      industry: item.intake.industry,
      employeeBand: item.intake.companySize,
      headquarters: "Not supplied",
      summary:
        "No external company research was supplied for this brief-aligned evaluation case.",
      productsAndServices: [],
      operatingSignals: [],
      dataAiSignals: [],
      regulatorySignals: [],
      unknowns: ["External company context was intentionally omitted"],
      sources: [],
    });
    return {
      id: item.id,
      contactName: "Not supplied",
      senderEmail: `case@${domain}`,
      companyName: "Company identity not supplied",
      description: item.intake.description,
      selfReportedIndustry: item.intake.industry,
      companySize: item.intake.companySize,
      urgency: item.intake.urgency,
      submittedAt,
    };
  });
  const labels: GoldLabel[] = dataset.cases.map((item) => ({
    enquiryId: item.id,
    expectedServiceLine: item.expected.serviceLine,
    expectedComplexity: item.expected.complexity,
    expectedUseCase: item.expected.useCase,
    expectedReview: item.expected.reviewRequired,
    split: "holdout",
  }));
  const provenance: EvaluationDatasetProvenance = {
    kind: dataset.metadata.kind,
    purpose: dataset.metadata.purpose,
    generatedBy: dataset.metadata.generatedBy,
    labeledBy: dataset.metadata.labeledBy,
    independentLabels: dataset.metadata.independentLabels,
    frozenAt: dataset.metadata.frozenAt,
  };

  return {
    name: dataset.metadata.name,
    enquiries,
    labels,
    researchProvider: new IntakeOnlyResearchProvider(dossiers),
    quality: auditEvaluationDataset({ enquiries, labels, provenance }),
  };
}
