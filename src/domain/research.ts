import type { CompanyDossier, Enquiry } from "@/domain/schemas";

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "yahoo.com",
  "proton.me",
  "protonmail.com",
]);

const MULTI_PART_SUFFIXES = new Set(["co.uk", "com.au", "co.nz", "co.jp"]);

export type ResearchIdentity = {
  domain: string;
  researchable: boolean;
  reason: "personal_email_domain" | "invalid_email" | null;
};

export type CompanyResearchResult = {
  status: "complete" | "unavailable" | "skipped";
  dossier: CompanyDossier | null;
  reason: string | null;
};

export interface CompanyResearchProvider {
  research(enquiry: Enquiry): Promise<CompanyResearchResult>;
}

export class IntakeOnlyResearchProvider implements CompanyResearchProvider {
  async research(): Promise<CompanyResearchResult> {
    return { status: "skipped", dossier: null, reason: null };
  }
}

function registrableDomain(hostname: string) {
  const labels = hostname.toLowerCase().split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");

  const suffix = labels.slice(-2).join(".");
  return MULTI_PART_SUFFIXES.has(suffix)
    ? labels.slice(-3).join(".")
    : labels.slice(-2).join(".");
}

export function extractResearchIdentity(email: string): ResearchIdentity {
  const atIndex = email.lastIndexOf("@");
  if (atIndex < 1 || atIndex === email.length - 1) {
    return { domain: "", researchable: false, reason: "invalid_email" };
  }

  const domain = registrableDomain(email.slice(atIndex + 1));
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    return { domain, researchable: false, reason: "personal_email_domain" };
  }

  return { domain, researchable: true, reason: null };
}

export class InMemoryCompanyResearchProvider
  implements CompanyResearchProvider
{
  private readonly companiesByDomain: Map<string, CompanyDossier>;

  constructor(companies: CompanyDossier[]) {
    this.companiesByDomain = new Map(
      companies.map((company) => [company.domain, company]),
    );
  }

  async research(enquiry: Enquiry): Promise<CompanyResearchResult> {
    const identity = extractResearchIdentity(enquiry.senderEmail);
    if (!identity.researchable) {
      return { status: "skipped", dossier: null, reason: identity.reason };
    }

    const dossier = this.companiesByDomain.get(identity.domain) ?? null;
    return dossier
      ? { status: "complete", dossier, reason: null }
      : { status: "unavailable", dossier: null, reason: "company_not_found" };
  }
}
