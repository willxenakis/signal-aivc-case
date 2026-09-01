import { z } from "zod";

export const SERVICE_LINES = [
  "ai_strategy_value",
  "data_ai_platforms",
  "ai_applications_automation",
  "decision_intelligence_operations",
  "ai_governance_risk_security",
  "adoption_operating_model",
] as const;

export const SERVICE_LINE_LABELS: Record<(typeof SERVICE_LINES)[number], string> = {
  ai_strategy_value: "AI Strategy & Value",
  data_ai_platforms: "Data & AI Platforms",
  ai_applications_automation: "AI Applications & Automation",
  decision_intelligence_operations: "Decision Intelligence & Operations",
  ai_governance_risk_security: "AI Governance, Risk & Security",
  adoption_operating_model: "Adoption & Operating Model",
};

export const INDUSTRIES = [
  "manufacturing",
  "healthcare",
  "financial_services",
  "insurance",
  "energy_utilities",
  "logistics",
  "retail",
  "technology",
  "life_sciences",
  "telecom",
  "government",
  "professional_services",
  "unknown",
] as const;

export const INTAKE_EVIDENCE_SOURCE_REFS = [
  "enquiry.description",
  "enquiry.selfReportedIndustry",
  "enquiry.companySize",
  "enquiry.urgency",
] as const;

export const companySourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  excerpt: z.string().min(10),
  retrievedAt: z.string().datetime(),
  trustTier: z.enum(["official", "registry", "secondary"]),
});

export const companyDossierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(3),
  identityConfidence: z.enum(["verified", "partial", "unresolved"]),
  industry: z.enum(INDUSTRIES),
  employeeBand: z.enum(["1-50", "51-250", "251-1000", "1001-5000", "5000+"]),
  headquarters: z.string().min(1),
  summary: z.string().min(20),
  productsAndServices: z.array(z.string()),
  operatingSignals: z.array(z.string()),
  dataAiSignals: z.array(z.string()),
  regulatorySignals: z.array(z.string()),
  unknowns: z.array(z.string()),
  sources: z.array(companySourceSchema),
});

export const enquirySchema = z.object({
  id: z.string().min(1),
  contactName: z.string().min(1),
  senderEmail: z.string().email(),
  companyName: z.string().min(1),
  description: z.string().min(20),
  selfReportedIndustry: z.enum(INDUSTRIES).nullable(),
  companySize: z.enum(["1-50", "51-250", "251-1000", "1001-5000", "5000+"]),
  urgency: z.enum(["low", "standard", "high", "critical"]),
  submittedAt: z.string().datetime(),
});

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["intake", "company_research"]),
  sourceRef: z.string().min(1),
  excerpt: z.string().min(3),
  supports: z
    .array(
      z.enum([
        "service_line",
        "complexity",
        "use_case",
        "urgency",
        "company_identity",
      ]),
    )
    .min(1),
  importance: z.enum(["decisive", "supporting", "contextual"]),
});

export const classificationSchema = z.object({
  summary: z.string().min(10),
  primaryServiceLine: z.enum(SERVICE_LINES),
  secondaryServiceLine: z.enum(SERVICE_LINES).nullable(),
  complexity: z.enum(["simple", "moderate", "complex"]),
  useCase: z.string().min(2),
  decisionFactors: z.array(
    z.object({
      label: z.string().min(2),
      importance: z.enum(["decisive", "supporting", "contextual"]),
      evidenceIds: z.array(z.string()).min(1),
    }),
  ),
  missingInformation: z.array(z.string()),
  alternatives: z.array(
    z.object({
      serviceLine: z.enum(SERVICE_LINES),
      reason: z.string().min(3),
    }),
  ),
  requestedReview: z.boolean(),
  reviewReasons: z.array(z.string()),
});

export const routeDecisionSchema = z.object({
  status: z.enum(["auto_routed", "needs_review"]),
  destination: z.object({
    team: z.string().min(1),
    lead: z.string().min(1),
    consultingTeams: z.array(z.string()),
  }),
  priority: z.enum(["routine", "normal", "expedited", "immediate"]),
  rulesApplied: z.array(z.string()),
  reviewReasons: z.array(z.string()),
});

export const provenanceSchema = z.object({
  mode: z.enum(["synthetic_baseline", "live_ai", "fallback"]),
  provider: z.string().min(1),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  taxonomyVersion: z.string().min(1),
  schemaVersion: z.string().min(1),
  researchProvider: z.string().min(1),
  generatedAt: z.string().datetime(),
  latencyMs: z.number().nonnegative(),
  tokenUsage: z
    .object({ input: z.number().nonnegative(), output: z.number().nonnegative() })
    .nullable(),
});

export const decisionPackageSchema = z.object({
  id: z.string().min(1),
  enquiry: enquirySchema,
  company: companyDossierSchema,
  researchStatus: z.enum(["complete", "unavailable", "skipped"]),
  classification: classificationSchema,
  evidence: z.array(evidenceItemSchema).min(1),
  route: routeDecisionSchema,
  provenance: provenanceSchema,
});

export type ServiceLine = (typeof SERVICE_LINES)[number];
export type Industry = (typeof INDUSTRIES)[number];
export type CompanyDossier = z.infer<typeof companyDossierSchema>;
export type CompanySource = z.infer<typeof companySourceSchema>;
export type Enquiry = z.infer<typeof enquirySchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type RouteDecision = z.infer<typeof routeDecisionSchema>;
export type DecisionPackage = z.infer<typeof decisionPackageSchema>;
export type ReviewPolicy = "conservative" | "balanced" | "aggressive";
