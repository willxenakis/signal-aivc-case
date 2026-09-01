import { describe, expect, it } from "vitest";

import { buildSyntheticEvaluation } from "@/domain/synthetic-run";

describe("synthetic baseline evaluation", () => {
  it("produces a development benchmark without treating it as blind validation", async () => {
    const result = await buildSyntheticEvaluation("balanced");

    expect(result.decisions).toHaveLength(60);
    expect(result.metrics.total).toBe(60);
    expect(result.developmentMetrics.total).toBe(40);
    expect(result.holdoutMetrics.total).toBe(20);
    expect(result.metrics.accuracy).toBeGreaterThanOrEqual(0.8);
    expect(result.metrics.autoRoutePrecision).toBeGreaterThanOrEqual(0.9);
    expect(result.datasetQuality.warnings).toContain(
      "labels_not_independently_authored",
    );
  });
});
