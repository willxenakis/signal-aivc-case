import { describe, expect, it } from "vitest";

import { evaluatePredictions } from "@/domain/evaluation";

describe("evaluation metrics", () => {
  it("reports auto-route precision separately from automation coverage", () => {
    const result = evaluatePredictions([
      { expectedServiceLine: "ai_strategy_value", predictedServiceLine: "ai_strategy_value", expectedReview: false, predictedReview: false },
      { expectedServiceLine: "data_ai_platforms", predictedServiceLine: "ai_applications_automation", expectedReview: true, predictedReview: true },
      { expectedServiceLine: "ai_governance_risk_security", predictedServiceLine: "ai_strategy_value", expectedReview: true, predictedReview: false },
      { expectedServiceLine: "ai_applications_automation", predictedServiceLine: "ai_applications_automation", expectedReview: false, predictedReview: false },
    ]);

    expect(result.accuracy).toBe(0.5);
    expect(result.macroF1).toBeCloseTo(1 / 3);
    expect(result.perServiceLine.ai_strategy_value.support).toBe(1);
    expect(result.automationCoverage).toBe(0.75);
    expect(result.autoRoutePrecision).toBeCloseTo(2 / 3);
    expect(result.reviewCaptureRate).toBe(0.5);
    expect(result.reviewPrecision).toBe(1);
    expect(result.unnecessaryReviewRate).toBe(0);
  });

  it("reports unavailable precision as null instead of a misleading zero", () => {
    const result = evaluatePredictions([
      { expectedServiceLine: "ai_strategy_value", predictedServiceLine: "ai_strategy_value", expectedReview: true, predictedReview: true },
      { expectedServiceLine: "data_ai_platforms", predictedServiceLine: "data_ai_platforms", expectedReview: false, predictedReview: true },
    ]);

    expect(result.autoRoutePrecision).toBeNull();
    expect(result.reviewPrecision).toBe(0.5);
    expect(result.unnecessaryReviewRate).toBe(1);
  });
});
