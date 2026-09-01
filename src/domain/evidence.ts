import {
  INTAKE_EVIDENCE_SOURCE_REFS,
  type DecisionPackage,
} from "@/domain/schemas";

const intakeEvidenceSourceRefs = new Set<string>(
  INTAKE_EVIDENCE_SOURCE_REFS,
);

export function validateEvidencePackage(decision: DecisionPackage): string[] {
  const errors: string[] = [];
  const evidenceById = new Map(decision.evidence.map((item) => [item.id, item]));
  const companySourceIds = new Set(
    decision.company.sources.map((source) => source.id),
  );

  for (const factor of decision.classification.decisionFactors) {
    for (const evidenceId of factor.evidenceIds) {
      if (!evidenceById.has(evidenceId)) {
        errors.push(
          `Decision factor '${evidenceId}' references missing evidence.`,
        );
      }
    }
  }

  for (const evidence of decision.evidence) {
    if (
      evidence.sourceType === "company_research" &&
      !companySourceIds.has(evidence.sourceRef)
    ) {
      errors.push(
        `Research evidence '${evidence.id}' references an unknown company source.`,
      );
    }
    if (
      evidence.sourceType === "intake" &&
      !intakeEvidenceSourceRefs.has(evidence.sourceRef)
    ) {
      errors.push(
        `Intake evidence '${evidence.id}' references an unknown enquiry field.`,
      );
    }
  }

  const serviceLineSupport = decision.evidence.some(
    (item) =>
      item.supports.includes("service_line") &&
      item.importance !== "contextual",
  );
  if (!serviceLineSupport) {
    errors.push("Primary service line has no supporting evidence.");
  }

  return [...new Set(errors)];
}
