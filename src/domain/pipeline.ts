import type { EvidenceClassifier } from "@/domain/classifier";
import { applyRoutingPolicy } from "@/domain/routing";
import type { CompanyResearchProvider } from "@/domain/research";
import {
  decisionPackageSchema,
  enquirySchema,
  type CompanyDossier,
  type DecisionPackage,
  type Enquiry,
  type ReviewPolicy,
} from "@/domain/schemas";

type TriageOptions = {
  enquiry: Enquiry;
  researchProvider: CompanyResearchProvider;
  classifier: EvidenceClassifier;
  reviewPolicy: ReviewPolicy;
};

function unresolvedCompany(enquiry: Enquiry): CompanyDossier {
  const domain = enquiry.senderEmail.split("@")[1] ?? "unknown.example";
  return {
    id: `UNRESOLVED-${enquiry.id}`,
    name: enquiry.companyName,
    domain,
    identityConfidence: "unresolved",
    industry: enquiry.selfReportedIndustry ?? "unknown",
    employeeBand: enquiry.companySize,
    headquarters: "Unknown",
    summary:
      "Company research was unavailable; this dossier contains only self-reported intake information.",
    productsAndServices: [],
    operatingSignals: [],
    dataAiSignals: [],
    regulatorySignals: [],
    unknowns: ["Verified company identity", "External operating context"],
    sources: [],
  };
}

export async function triageEnquiry({
  enquiry: rawEnquiry,
  researchProvider,
  classifier,
  reviewPolicy,
}: TriageOptions): Promise<DecisionPackage> {
  const enquiry = enquirySchema.parse(rawEnquiry);
  let researchStatus: DecisionPackage["researchStatus"] = "unavailable";
  let company = unresolvedCompany(enquiry);

  try {
    const research = await researchProvider.research(enquiry);
    researchStatus = research.status;
    if (research.dossier) company = research.dossier;
  } catch {
    researchStatus = "unavailable";
  }

  const result = await classifier.classify(enquiry, company);

  const provisional: DecisionPackage = {
    id: `DEC-${enquiry.id}`,
    enquiry,
    company,
    researchStatus,
    classification: result.classification,
    evidence: result.evidence,
    route: {
      status: "needs_review",
      destination: {
        team: "Pending routing",
        lead: "Triage queue",
        consultingTeams: [],
      },
      priority: "normal",
      rulesApplied: [],
      reviewReasons: [],
    },
    provenance: {
      ...result.provenance,
      promptVersion: "triage-v1",
      taxonomyVersion: "2026.08",
      schemaVersion: "1.0",
      researchProvider:
        researchStatus === "complete"
          ? "synthetic-company-registry"
          : "unavailable",
      generatedAt: new Date().toISOString(),
    },
  };

  provisional.route = applyRoutingPolicy(provisional, reviewPolicy);
  return decisionPackageSchema.parse(provisional);
}
