import type {
  CompanyDossier,
  DecisionPackage,
  Enquiry,
} from "@/domain/schemas";

export function makeCompany(
  overrides: Partial<CompanyDossier> = {},
): CompanyDossier {
  return {
    id: "company-northstar",
    name: "Northstar Industrial Systems",
    domain: "northstar.example",
    identityConfidence: "verified",
    industry: "manufacturing",
    employeeBand: "1001-5000",
    headquarters: "Cleveland, Ohio",
    summary:
      "Northstar manufactures industrial equipment and operates twelve service centers across North America.",
    productsAndServices: ["Industrial equipment", "Field maintenance services"],
    operatingSignals: [
      "Runs a distributed field-service operation",
      "Maintains high-value industrial assets",
    ],
    dataAiSignals: ["Uses a cloud ERP and centralized maintenance history"],
    regulatorySignals: ["Handles customer equipment telemetry"],
    unknowns: ["Current model governance process"],
    sources: [
      {
        id: "SRC-NORTHSTAR-ABOUT",
        title: "Northstar - About",
        url: "https://northstar.example/about",
        excerpt:
          "Northstar manufactures industrial equipment and supports customers through twelve service centers.",
        retrievedAt: "2026-08-31T14:00:00.000Z",
        trustTier: "official",
      },
      {
        id: "SRC-NORTHSTAR-OPS",
        title: "Northstar - Service operations",
        url: "https://northstar.example/operations",
        excerpt:
          "Technicians use maintenance histories and equipment telemetry to resolve customer issues.",
        retrievedAt: "2026-08-31T14:00:00.000Z",
        trustTier: "official",
      },
    ],
    ...overrides,
  };
}

export function makeEnquiry(overrides: Partial<Enquiry> = {}): Enquiry {
  return {
    id: "ENQ-001",
    contactName: "Alex Morgan",
    senderEmail: "alex@northstar.example",
    companyName: "Northstar Industrial Systems",
    description:
      "We want a technician copilot that summarizes maintenance history and drafts the next recommended action.",
    selfReportedIndustry: "manufacturing",
    companySize: "1001-5000",
    urgency: "standard",
    submittedAt: "2026-08-31T14:15:00.000Z",
    ...overrides,
  };
}

export function makeDecision(): DecisionPackage {
  const enquiry = makeEnquiry();
  const company = makeCompany();

  return {
    id: "DEC-001",
    enquiry,
    company,
    researchStatus: "complete",
    classification: {
      summary:
        "Build a technician-facing copilot grounded in maintenance history.",
      primaryServiceLine: "ai_applications_automation",
      secondaryServiceLine: null,
      complexity: "moderate",
      useCase: "field_service_copilot",
      decisionFactors: [
        {
          label: "Explicit request for a workflow copilot",
          importance: "decisive",
          evidenceIds: ["EV-INTAKE-001"],
        },
        {
          label: "Requires integration with maintenance history",
          importance: "supporting",
          evidenceIds: ["EV-RESEARCH-001"],
        },
      ],
      missingInformation: [],
      alternatives: [
        {
          serviceLine: "decision_intelligence_operations",
          reason: "The workflow could later include maintenance optimization.",
        },
      ],
      requestedReview: false,
      reviewReasons: [],
    },
    evidence: [
      {
        id: "EV-INTAKE-001",
        sourceType: "intake",
        sourceRef: "enquiry.description",
        excerpt: enquiry.description,
        supports: ["service_line", "use_case"],
        importance: "decisive",
      },
      {
        id: "EV-RESEARCH-001",
        sourceType: "company_research",
        sourceRef: "SRC-NORTHSTAR-OPS",
        excerpt: company.sources[1].excerpt,
        supports: ["complexity", "company_identity"],
        importance: "supporting",
      },
    ],
    route: {
      status: "auto_routed",
      destination: {
        team: "AI Applications & Automation",
        lead: "Maya Chen",
        consultingTeams: [],
      },
      priority: "normal",
      rulesApplied: ["ROUTE-AIA-001"],
      reviewReasons: [],
    },
    provenance: {
      mode: "synthetic_baseline",
      provider: "local",
      model: "evidence-rules-v1",
      promptVersion: "triage-v1",
      taxonomyVersion: "2026.08",
      schemaVersion: "1.0",
      researchProvider: "synthetic-company-registry",
      generatedAt: "2026-08-31T14:15:01.000Z",
      latencyMs: 12,
      tokenUsage: null,
    },
  };
}
