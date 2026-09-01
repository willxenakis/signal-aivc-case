import { describe, expect, it } from "vitest";

import { applyRoutingPolicy } from "@/domain/routing";
import { makeDecision } from "@/test/factories";

describe("routing policy", () => {
  it("maps service-line judgment to a deterministic team destination", () => {
    const result = applyRoutingPolicy(makeDecision(), "balanced");

    expect(result.destination.team).toBe("AI Applications & Automation");
    expect(result.status).toBe("auto_routed");
    expect(result.rulesApplied).toContain("ROUTE-AIA-001");
  });

  it("accelerates critical enquiries without turning urgency into routing ambiguity", () => {
    const decision = makeDecision();
    decision.enquiry.urgency = "critical";

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.status).toBe("auto_routed");
    expect(result.priority).toBe("immediate");
    expect(result.destination.lead).toBe("Maya Chen");
    expect(result.reviewReasons).not.toContain("critical_urgency");
  });

  it("adds risk consultation for regulated data access", () => {
    const decision = makeDecision();
    decision.company.industry = "healthcare";
    decision.classification.useCase = "claims_review";

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.destination.consultingTeams).toContain(
      "AI Governance, Risk & Security",
    );
    expect(result.rulesApplied).toContain("CONSULT-RISK-004");
  });

  it("does not confuse ordinary scoping questions or complexity with routing ambiguity", () => {
    const decision = makeDecision();
    decision.classification.complexity = "complex";
    decision.classification.missingInformation = [
      "Implementation budget",
      "Target delivery timeline",
    ];

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.status).toBe("auto_routed");
    expect(result.reviewReasons).not.toContain("complex_scope");
    expect(result.reviewReasons).not.toContain("missing_information");
  });

  it("keeps the service-line owner constant across complexity levels", () => {
    const leads = (["simple", "moderate", "complex"] as const).map(
      (complexity) => {
        const decision = makeDecision();
        decision.classification.complexity = complexity;
        return applyRoutingPolicy(decision, "balanced").destination.lead;
      },
    );

    expect(leads).toEqual(["Maya Chen", "Maya Chen", "Maya Chen"]);
  });

  it("does not block a clear route when optional company identity is unavailable", () => {
    const decision = makeDecision();
    decision.company.identityConfidence = "unresolved";

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.status).toBe("auto_routed");
    expect(result.reviewReasons).not.toContain("unverified_company_identity");
  });

  it("sends a package with a noncanonical evidence citation to review", () => {
    const decision = makeDecision();
    decision.evidence[0].sourceRef = "enquiry.industry";

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.status).toBe("needs_review");
    expect(result.reviewReasons).toContain("invalid_evidence_package");
  });

  it("keeps the conservative policy available for organizations that review broad scope", () => {
    const decision = makeDecision();
    decision.classification.complexity = "complex";
    decision.classification.missingInformation = ["Implementation budget"];

    const result = applyRoutingPolicy(decision, "conservative");

    expect(result.status).toBe("needs_review");
    expect(result.reviewReasons).toContain("complex_scope");
    expect(result.reviewReasons).toContain("missing_information");
  });

  it("ignores non-blocking explanatory reasons unless the classifier requests review", () => {
    const decision = makeDecision();
    decision.classification.requestedReview = false;
    decision.classification.reviewReasons = [
      "Budget and timeline are not yet known.",
    ];

    const result = applyRoutingPolicy(decision, "balanced");

    expect(result.status).toBe("auto_routed");
  });
});
