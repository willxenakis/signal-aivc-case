import { describe, expect, it } from "vitest";

import { LocalEvidenceClassifier } from "@/domain/classifier";
import {
  parseExternalEvaluationDataset,
  toLiveEvaluationDataset,
} from "@/eval/external-dataset";
import { runLiveEvaluationDataset } from "@/eval/live-evaluation";

const externalFixture = {
  schemaVersion: "1.0",
  metadata: {
    name: "Independently authored intake set",
    kind: "synthetic",
    purpose: "blind_evaluation",
    generatedBy: "scenario author",
    labeledBy: "two-reviewer adjudication",
    independentLabels: true,
    frozenAt: "2026-08-30T12:00:00.000Z",
  },
  cases: [
    {
      id: "BLIND-A",
      intake: {
        description:
          "Our teams keep rebuilding the same customer definitions and need a shared governed foundation before launching more AI work.",
        industry: "retail",
        companySize: "1001-5000",
        urgency: "standard",
      },
      expected: {
        serviceLine: "data_ai_platforms",
        complexity: "complex",
        useCase: "governed_customer_data_foundation",
        reviewRequired: false,
      },
    },
  ],
} as const;

describe("external blind evaluation dataset", () => {
  it("accepts a brief-aligned independently labeled dataset", () => {
    const parsed = parseExternalEvaluationDataset(externalFixture);
    const dataset = toLiveEvaluationDataset(parsed);

    expect(dataset.name).toBe("Independently authored intake set");
    expect(dataset.enquiries[0]).toMatchObject({
      description: externalFixture.cases[0].intake.description,
      selfReportedIndustry: "retail",
      companySize: "1001-5000",
      urgency: "standard",
    });
    expect(dataset.labels[0]).toMatchObject({
      enquiryId: "BLIND-A",
      expectedServiceLine: "data_ai_platforms",
      expectedComplexity: "complex",
      expectedReview: false,
    });
    expect(dataset.quality.warnings).toContain("insufficient_sample_size");
  });

  it("rejects duplicate case IDs and missing brief fields", () => {
    const duplicate = {
      ...externalFixture,
      cases: [externalFixture.cases[0], externalFixture.cases[0]],
    };
    expect(() => parseExternalEvaluationDataset(duplicate)).toThrow(
      "unique case IDs",
    );
    expect(() =>
      parseExternalEvaluationDataset({
        ...externalFixture,
        cases: [
          {
            ...externalFixture.cases[0],
            intake: {
              description: externalFixture.cases[0].intake.description,
              industry: "retail",
              urgency: "standard",
            },
          },
        ],
      }),
    ).toThrow();
  });

  it("runs through the same strict evaluator without synthetic registry data", async () => {
    const dataset = toLiveEvaluationDataset(
      parseExternalEvaluationDataset(externalFixture),
    );
    const report = await runLiveEvaluationDataset({
      dataset,
      classifier: new LocalEvidenceClassifier(),
      provider: "openai",
      model: "test-model",
      split: "holdout",
      reviewPolicy: "balanced",
      generatedAt: "2026-08-31T12:00:00.000Z",
    });

    expect(report.config.datasetName).toBe(
      "Independently authored intake set",
    );
    expect(report.summary.attempted).toBe(1);
    expect(report.datasetQuality.warnings).toContain(
      "insufficient_sample_size",
    );
    expect(report.cases[0]).toMatchObject({
      enquiryId: "BLIND-A",
      expectedServiceLine: "data_ai_platforms",
    });
  });
});
