import { validateEvidencePackage } from "@/domain/evidence";
import {
  SERVICE_LINE_LABELS,
  type DecisionPackage,
  type ReviewPolicy,
  type RouteDecision,
  type ServiceLine,
} from "@/domain/schemas";

const ROUTES: Record<
  ServiceLine,
  { lead: string; ruleId: string }
> = {
  ai_strategy_value: { lead: "Elena Ruiz", ruleId: "ROUTE-ASV-001" },
  data_ai_platforms: { lead: "Jon Bell", ruleId: "ROUTE-DAP-001" },
  ai_applications_automation: { lead: "Maya Chen", ruleId: "ROUTE-AIA-001" },
  decision_intelligence_operations: {
    lead: "Owen Brooks",
    ruleId: "ROUTE-DIO-001",
  },
  ai_governance_risk_security: {
    lead: "Priya Shah",
    ruleId: "ROUTE-GRS-001",
  },
  adoption_operating_model: { lead: "Sam Okafor", ruleId: "ROUTE-AOM-001" },
};

const REGULATED_INDUSTRIES = new Set([
  "healthcare",
  "financial_services",
  "insurance",
  "government",
]);
const SENSITIVE_USE_CASES = new Set([
  "claims_review",
  "fraud_detection",
  "customer_data",
  "healthcare_operations",
]);

export function applyRoutingPolicy(
  decision: DecisionPackage,
  policy: ReviewPolicy,
): RouteDecision {
  const primary = decision.classification.primaryServiceLine;
  const route = ROUTES[primary];
  const reviewReasons = new Set<string>();
  const rulesApplied = [route.ruleId];
  const consultingTeams: string[] = [];

  if (decision.classification.requestedReview) {
    for (const reason of decision.classification.reviewReasons) {
      reviewReasons.add(reason);
    }
    reviewReasons.add("classifier_requested_review");
  }
  if (validateEvidencePackage(decision).length > 0) {
    reviewReasons.add("invalid_evidence_package");
  }
  if (policy === "conservative") {
    if (decision.classification.complexity === "complex") {
      reviewReasons.add("complex_scope");
    }
    if (decision.classification.missingInformation.length > 0) {
      reviewReasons.add("missing_information");
    }
    if (decision.enquiry.urgency === "high") reviewReasons.add("high_urgency");
    if (decision.classification.secondaryServiceLine) {
      reviewReasons.add("cross_service_scope");
    }
    if (decision.company.identityConfidence === "partial") {
      reviewReasons.add("partially_verified_company");
    }
    if (decision.company.identityConfidence === "unresolved") {
      reviewReasons.add("unverified_company_identity");
    }
  }

  if (
    REGULATED_INDUSTRIES.has(decision.company.industry) &&
    SENSITIVE_USE_CASES.has(decision.classification.useCase) &&
    primary !== "ai_governance_risk_security"
  ) {
    consultingTeams.push(SERVICE_LINE_LABELS.ai_governance_risk_security);
    rulesApplied.push("CONSULT-RISK-004");
  }

  if (decision.classification.secondaryServiceLine) {
    consultingTeams.push(
      SERVICE_LINE_LABELS[decision.classification.secondaryServiceLine],
    );
    rulesApplied.push("CONSULT-SECONDARY-002");
  }

  const priority = {
    low: "routine",
    standard: "normal",
    high: "expedited",
    critical: "immediate",
  }[decision.enquiry.urgency] as RouteDecision["priority"];

  return {
    status: reviewReasons.size > 0 ? "needs_review" : "auto_routed",
    destination: {
      team: SERVICE_LINE_LABELS[primary],
      lead: route.lead,
      consultingTeams: [...new Set(consultingTeams)],
    },
    priority,
    rulesApplied,
    reviewReasons: [...reviewReasons],
  };
}
