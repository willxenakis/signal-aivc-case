import { describe, expect, it } from "vitest";

import {
  LocalEvidenceClassifier,
  type EvidenceClassifier,
} from "@/domain/classifier";
import { runSyntheticLiveEvaluation } from "@/eval/live-evaluation";

describe("live evaluation report", () => {
  it("runs only the requested held-out cases and produces live-only metrics", async () => {
    const report = await runSyntheticLiveEvaluation({
      classifier: new LocalEvidenceClassifier(),
      provider: "openai",
      model: "test-model",
      split: "holdout",
      reviewPolicy: "balanced",
      limit: 2,
      generatedAt: "2026-08-31T12:00:00.000Z",
    });

    expect(report.config.split).toBe("holdout");
    expect(report.summary.attempted).toBe(2);
    expect(report.summary.succeeded).toBe(2);
    expect(report.summary.failed).toBe(0);
    expect(report.summary.providerSuccessRate).toBe(1);
    expect(report.summary.complexityAccuracyAmongSuccesses).toBeGreaterThanOrEqual(0);
    expect(report.cases[0]).toHaveProperty("expectedComplexity");
    expect(report.datasetQuality.warnings).toContain(
      "labels_not_independently_authored",
    );
    expect(report.summary.successfulCaseMetrics.total).toBe(2);
    expect(report.summary.policyComparison.balanced.total).toBe(2);
    expect(report.summary.policyComparison.conservative.total).toBe(2);
    expect(report.summary.policyComparison.aggressive.total).toBe(2);
    expect(report.cases.every((item) => item.status === "success")).toBe(true);
    expect(JSON.stringify(report)).not.toContain("apiKey");
  });

  it("counts provider errors without substituting fallback predictions and redacts secrets", async () => {
    const secret = "sk-test-super-secret";
    const baseline = new LocalEvidenceClassifier();
    const sometimesFailing: EvidenceClassifier = {
      async classify(enquiry, company) {
        if (enquiry.id === "CMP-09-ENQ-01") {
          throw new Error(`401 invalid credential ${secret}`);
        }
        return baseline.classify(enquiry, company);
      },
    };

    const report = await runSyntheticLiveEvaluation({
      classifier: sometimesFailing,
      provider: "openai",
      model: "test-model",
      split: "holdout",
      reviewPolicy: "balanced",
      limit: 2,
      redactSecrets: [secret],
      generatedAt: "2026-08-31T12:00:00.000Z",
    });

    expect(report.summary.attempted).toBe(2);
    expect(report.summary.succeeded).toBe(1);
    expect(report.summary.failed).toBe(1);
    expect(report.summary.providerSuccessRate).toBe(0.5);
    expect(report.summary.successfulCaseMetrics.total).toBe(1);
    expect(report.summary.endToEndClassificationAccuracy).toBe(0.5);
    expect(report.cases[0]).toMatchObject({
      status: "error",
      error: { category: "authentication" },
    });
    expect(JSON.stringify(report)).not.toContain(secret);
    expect(JSON.stringify(report)).toContain("[REDACTED]");
  });
});
