import { describe, expect, it } from "vitest";

import { validateEvidencePackage } from "@/domain/evidence";
import { makeDecision } from "@/test/factories";

describe("evidence integrity", () => {
  it("accepts decision factors that reference intake and research evidence", () => {
    expect(validateEvidencePackage(makeDecision())).toEqual([]);
  });

  it("rejects a decision factor that cites an unknown evidence id", () => {
    const decision = makeDecision();
    decision.classification.decisionFactors[0].evidenceIds = ["EV-404"];

    expect(validateEvidencePackage(decision)).toContain(
      "Decision factor 'EV-404' references missing evidence.",
    );
  });

  it("rejects an intake citation that is not a canonical enquiry field", () => {
    const decision = makeDecision();
    decision.evidence[0].sourceRef = "enquiry.industry";

    expect(validateEvidencePackage(decision)).toContain(
      "Intake evidence 'EV-INTAKE-001' references an unknown enquiry field.",
    );
  });

  it("rejects research evidence that is absent from the company dossier", () => {
    const decision = makeDecision();
    decision.evidence[1].sourceRef = "SRC-NOT-IN-DOSSIER";

    expect(validateEvidencePackage(decision)).toContain(
      "Research evidence 'EV-RESEARCH-001' references an unknown company source.",
    );
  });

  it("requires every primary classification to have decisive or supporting evidence", () => {
    const decision = makeDecision();
    decision.evidence = decision.evidence.map((item) => ({
      ...item,
      supports: ["complexity" as const],
    }));

    expect(validateEvidencePackage(decision)).toContain(
      "Primary service line has no supporting evidence.",
    );
  });
});
