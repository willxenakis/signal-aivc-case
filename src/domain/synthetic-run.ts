import { syntheticCompanies } from "@/data/companies";
import { syntheticEnquiries } from "@/data/enquiries";
import {
  SYNTHETIC_DATASET_PROVENANCE,
  syntheticGoldLabels,
} from "@/data/gold-labels";
import { LocalEvidenceClassifier } from "@/domain/classifier";
import { evaluatePredictions } from "@/domain/evaluation";
import { triageEnquiry } from "@/domain/pipeline";
import { InMemoryCompanyResearchProvider } from "@/domain/research";
import type { ReviewPolicy } from "@/domain/schemas";
import { auditEvaluationDataset } from "@/eval/dataset-quality";

export async function buildSyntheticEvaluation(policy: ReviewPolicy) {
  const researchProvider = new InMemoryCompanyResearchProvider(
    syntheticCompanies,
  );
  const classifier = new LocalEvidenceClassifier();
  const decisions = await Promise.all(
    syntheticEnquiries.map((enquiry) =>
      triageEnquiry({
        enquiry,
        researchProvider,
        classifier,
        reviewPolicy: policy,
      }),
    ),
  );
  const goldById = new Map(
    syntheticGoldLabels.map((label) => [label.enquiryId, label]),
  );
  const rows = decisions.map((decision) => {
      const expected = goldById.get(decision.enquiry.id);
      if (!expected) {
        throw new Error(`Missing gold label for ${decision.enquiry.id}`);
      }
      return {
        expectedServiceLine: expected.expectedServiceLine,
        predictedServiceLine: decision.classification.primaryServiceLine,
        expectedReview: expected.expectedReview,
        predictedReview: decision.route.status === "needs_review",
      };
    });
  const splitById = new Map(
    syntheticGoldLabels.map((label) => [label.enquiryId, label.split]),
  );
  const rowsForSplit = (split: "development" | "holdout") =>
    rows.filter((_, index) => splitById.get(decisions[index].enquiry.id) === split);
  const metrics = evaluatePredictions(rows);
  const developmentMetrics = evaluatePredictions(rowsForSplit("development"));
  const holdoutMetrics = evaluatePredictions(rowsForSplit("holdout"));

  return {
    decisions,
    goldLabels: syntheticGoldLabels,
    metrics,
    developmentMetrics,
    holdoutMetrics,
    datasetQuality: auditEvaluationDataset({
      enquiries: syntheticEnquiries,
      labels: syntheticGoldLabels,
      provenance: SYNTHETIC_DATASET_PROVENANCE,
    }),
  };
}
