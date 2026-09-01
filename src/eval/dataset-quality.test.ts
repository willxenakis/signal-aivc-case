import { describe, expect, it } from "vitest";

import { syntheticEnquiries } from "@/data/enquiries";
import {
  SYNTHETIC_DATASET_PROVENANCE,
  syntheticGoldLabels,
} from "@/data/gold-labels";
import { auditEvaluationDataset } from "@/eval/dataset-quality";
import { SERVICE_LINES } from "@/domain/schemas";

describe("evaluation dataset quality", () => {
  it("flags the current synthetic portfolio as development-only", () => {
    const audit = auditEvaluationDataset({
      enquiries: syntheticEnquiries,
      labels: syntheticGoldLabels,
      provenance: SYNTHETIC_DATASET_PROVENANCE,
    });

    expect(audit.independentLabels).toBe(false);
    expect(audit.ordinalLabelPredictability).toBeGreaterThan(0.9);
    expect(audit.warnings).toContain("labels_not_independently_authored");
    expect(audit.warnings).toContain("label_predictable_from_enquiry_ordinal");
  });

  it("returns no limitations for a sufficiently covered independent frozen set", () => {
    const enquiries = Array.from({ length: 60 }, (_, index) => ({
      ...syntheticEnquiries[index % syntheticEnquiries.length],
      id: `BLIND-${String(index + 1).padStart(3, "0")}`,
    }));
    const complexities = ["simple", "moderate", "complex"] as const;
    const labels = enquiries.map((enquiry, index) => ({
      ...syntheticGoldLabels[index % syntheticGoldLabels.length],
      enquiryId: enquiry.id,
      expectedServiceLine: SERVICE_LINES[index % SERVICE_LINES.length],
      expectedComplexity: complexities[index % complexities.length],
    }));

    const audit = auditEvaluationDataset({
      enquiries,
      labels,
      provenance: {
        kind: "synthetic",
        purpose: "blind_evaluation",
        generatedBy: "independent-scenario-author",
        labeledBy: "two-reviewer-adjudication",
        independentLabels: true,
        frozenAt: "2026-08-31T12:00:00.000Z",
      },
    });

    expect(audit.warnings).toEqual([]);
  });
});
