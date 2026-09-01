import type {
  EvaluationDatasetProvenance,
  GoldLabel,
} from "@/data/gold-labels";
import type { Enquiry, ServiceLine } from "@/domain/schemas";
import { SERVICE_LINES } from "@/domain/schemas";

const MINIMUM_BLIND_CASES = 60;
const MINIMUM_CASES_PER_SERVICE_LINE = 5;
const MINIMUM_CASES_PER_COMPLEXITY = 5;

type DatasetQualityAuditOptions = {
  enquiries: Enquiry[];
  labels: GoldLabel[];
  provenance: EvaluationDatasetProvenance;
};

export type DatasetQualityAudit = {
  purpose: EvaluationDatasetProvenance["purpose"];
  independentLabels: boolean;
  frozenAt: string | null;
  ordinalLabelPredictability: number;
  warnings: string[];
};

function ordinalLabelPredictability(labels: GoldLabel[]) {
  const labeledOrdinals = labels.flatMap((label) => {
    const match = label.enquiryId.match(/ENQ-(\d+)$/);
    return match
      ? [{ ordinal: match[1], label: label.expectedServiceLine }]
      : [];
  });
  if (labeledOrdinals.length === 0) return 0;

  const counts = new Map<string, Map<ServiceLine, number>>();
  for (const item of labeledOrdinals) {
    const byLabel = counts.get(item.ordinal) ?? new Map<ServiceLine, number>();
    byLabel.set(item.label, (byLabel.get(item.label) ?? 0) + 1);
    counts.set(item.ordinal, byLabel);
  }

  let correctlyPredicted = 0;
  for (const item of labeledOrdinals) {
    const byLabel = counts.get(item.ordinal)!;
    const dominant = [...byLabel.entries()].sort((a, b) => b[1] - a[1])[0][0];
    if (dominant === item.label) correctlyPredicted += 1;
  }
  return correctlyPredicted / labeledOrdinals.length;
}

export function auditEvaluationDataset({
  enquiries,
  labels,
  provenance,
}: DatasetQualityAuditOptions): DatasetQualityAudit {
  const warnings: string[] = [];
  const enquiryIds = new Set(enquiries.map((enquiry) => enquiry.id));
  const labelIds = new Set(labels.map((label) => label.enquiryId));
  const aligned =
    enquiryIds.size === labelIds.size &&
    [...enquiryIds].every((id) => labelIds.has(id));
  const predictability = ordinalLabelPredictability(labels);

  if (!aligned) warnings.push("enquiry_label_ids_do_not_align");
  if (!provenance.independentLabels) {
    warnings.push("labels_not_independently_authored");
  }
  if (!provenance.frozenAt) warnings.push("evaluation_set_not_frozen");
  if (predictability > 0.8) {
    warnings.push("label_predictable_from_enquiry_ordinal");
  }
  if (provenance.purpose !== "blind_evaluation") {
    warnings.push("development_data_not_blind_evaluation");
  }
  if (labels.length < MINIMUM_BLIND_CASES) {
    warnings.push("insufficient_sample_size");
  }
  if (
    SERVICE_LINES.some(
      (serviceLine) =>
        labels.filter(
          (label) => label.expectedServiceLine === serviceLine,
        ).length < MINIMUM_CASES_PER_SERVICE_LINE,
    )
  ) {
    warnings.push("insufficient_per_service_line_coverage");
  }
  if (
    (["simple", "moderate", "complex"] as const).some(
      (complexity) =>
        labels.filter(
          (label) => label.expectedComplexity === complexity,
        ).length < MINIMUM_CASES_PER_COMPLEXITY,
    )
  ) {
    warnings.push("insufficient_complexity_coverage");
  }

  return {
    purpose: provenance.purpose,
    independentLabels: provenance.independentLabels,
    frozenAt: provenance.frozenAt,
    ordinalLabelPredictability: predictability,
    warnings,
  };
}
