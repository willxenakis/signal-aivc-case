import { describe, expect, it } from "vitest";

import {
  companyDossierSchema,
  decisionPackageSchema,
  enquirySchema,
} from "@/domain/schemas";
import { makeCompany, makeDecision, makeEnquiry } from "@/test/factories";

describe("domain schemas", () => {
  it("accepts a well-formed synthetic company dossier", () => {
    expect(companyDossierSchema.parse(makeCompany()).domain).toBe(
      "northstar.example",
    );
  });

  it("rejects an enquiry without a usable description", () => {
    expect(() => enquirySchema.parse(makeEnquiry({ description: "short" }))).toThrow();
  });

  it("accepts a complete evidence-grounded decision package", () => {
    expect(decisionPackageSchema.parse(makeDecision()).route.status).toBe(
      "auto_routed",
    );
  });
});
