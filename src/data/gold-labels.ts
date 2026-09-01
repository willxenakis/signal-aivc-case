import type { ServiceLine } from "@/domain/schemas";

export type GoldLabel = {
  enquiryId: string;
  expectedServiceLine: ServiceLine;
  expectedComplexity: "simple" | "moderate" | "complex";
  expectedUseCase: string;
  expectedReview: boolean;
  split: "development" | "holdout";
};

export type EvaluationDatasetProvenance = {
  kind: "synthetic" | "historical";
  purpose: "development" | "blind_evaluation";
  generatedBy: string;
  labeledBy: string;
  independentLabels: boolean;
  frozenAt: string | null;
};

export const SYNTHETIC_DATASET_PROVENANCE: EvaluationDatasetProvenance = {
  kind: "synthetic",
  purpose: "development",
  generatedBy: "project synthetic seed matrix",
  labeledBy: "deterministic rules derived from seed position",
  independentLabels: false,
  frozenAt: null,
};

const serviceLines: ServiceLine[] = [
  "ai_strategy_value",
  "data_ai_platforms",
  "ai_applications_automation",
  "decision_intelligence_operations",
  "ai_governance_risk_security",
];

const useCasesByCompany = [
  ["ai_roadmap", "data_foundation", "technician_copilot", "predictive_maintenance", "ai_governance"],
  ["ai_portfolio", "healthcare_data_platform", "patient_access_assistant", "clinical_scheduling", "claims_review"],
  ["ai_strategy", "banking_data_platform", "credit_copilot", "fraud_detection", "model_risk"],
  ["ai_portfolio", "insurance_data_platform", "claims_copilot", "fraud_detection", "underwriting_governance"],
  ["ai_roadmap", "operational_data_model", "technician_copilot", "outage_optimization", "critical_ai_governance"],
  ["ai_strategy", "logistics_data_platform", "exception_copilot", "network_optimization", "workforce_governance"],
  ["ai_growth_strategy", "customer_data_platform", "customer_service_agent", "inventory_optimization", "consumer_ai_governance"],
  ["ai_product_strategy", "telemetry_data_platform", "support_copilot", "churn_prediction", "ai_adoption"],
  ["ai_portfolio", "regulated_knowledge_platform", "regulatory_copilot", "trial_risk_forecasting", "regulated_ai_validation"],
  ["ai_roadmap", "network_data_platform", "contact_center_assistant", "network_optimization", "customer_data_governance"],
  ["ai_portfolio", "public_data_foundation", "resident_service_assistant", "field_scheduling", "public_sector_ai_governance"],
  ["ai_strategy", "professional_services_knowledge", "engagement_copilot", "portfolio_optimization", "ai_adoption"],
];

export const syntheticGoldLabels: GoldLabel[] = Array.from(
  { length: 12 },
  (_, companyIndex) =>
    Array.from({ length: 5 }, (_, enquiryIndex): GoldLabel => {
      const companyNumber = companyIndex + 1;
      const enquiryNumber = enquiryIndex + 1;
      const isAdoptionCase =
        enquiryIndex === 4 && (companyNumber === 8 || companyNumber === 12);
      const expectedServiceLine = isAdoptionCase
        ? "adoption_operating_model"
        : serviceLines[enquiryIndex];
      const isComplex =
        enquiryIndex === 1 ||
        enquiryIndex === 3 ||
        (enquiryIndex === 4 && [2, 5, 9, 10, 11].includes(companyNumber));
      const expectedReview =
        ["CMP-02-ENQ-05", "CMP-05-ENQ-04"].includes(
          `CMP-${String(companyNumber).padStart(2, "0")}-ENQ-${String(enquiryNumber).padStart(2, "0")}`,
        ) || isComplex;

      return {
        enquiryId: `CMP-${String(companyNumber).padStart(2, "0")}-ENQ-${String(enquiryNumber).padStart(2, "0")}`,
        expectedServiceLine,
        expectedComplexity: isComplex ? "complex" : enquiryIndex === 0 ? "simple" : "moderate",
        expectedUseCase: useCasesByCompany[companyIndex][enquiryIndex],
        expectedReview,
        split: companyNumber <= 8 ? "development" : "holdout",
      };
    }),
).flat();
