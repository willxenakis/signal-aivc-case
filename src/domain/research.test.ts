import { describe, expect, it } from "vitest";

import {
  extractResearchIdentity,
  InMemoryCompanyResearchProvider,
  IntakeOnlyResearchProvider,
} from "@/domain/research";
import { makeCompany, makeEnquiry } from "@/test/factories";

describe("company research", () => {
  it("normalizes a corporate subdomain to its registrable company domain", () => {
    expect(extractResearchIdentity("alex@uk.northstar.example")).toEqual({
      domain: "northstar.example",
      researchable: true,
      reason: null,
    });
  });

  it("does not attempt domain research for a personal email provider", () => {
    expect(extractResearchIdentity("alex@gmail.com")).toEqual({
      domain: "gmail.com",
      researchable: false,
      reason: "personal_email_domain",
    });
  });

  it("returns a sourced dossier for a known synthetic company", async () => {
    const provider = new InMemoryCompanyResearchProvider([makeCompany()]);
    const result = await provider.research(makeEnquiry());

    expect(result.status).toBe("complete");
    expect(result.dossier?.sources).toHaveLength(2);
  });

  it("supports a brief-aligned intake flow without requiring company research", async () => {
    const result = await new IntakeOnlyResearchProvider().research();

    expect(result).toEqual({
      status: "skipped",
      dossier: null,
      reason: null,
    });
  });
});
