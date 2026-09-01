import { describe, expect, it } from "vitest";

import { syntheticCompanies } from "@/data/companies";
import { syntheticEnquiries } from "@/data/enquiries";
import { syntheticGoldLabels } from "@/data/gold-labels";
import {
  companyDossierSchema,
  enquirySchema,
} from "@/domain/schemas";

describe("synthetic evaluation portfolio", () => {
  it("contains 12 valid fictional companies and 60 valid enquiries", () => {
    expect(syntheticCompanies).toHaveLength(12);
    expect(syntheticEnquiries).toHaveLength(60);
    expect(() => syntheticCompanies.forEach((item) => companyDossierSchema.parse(item))).not.toThrow();
    expect(() => syntheticEnquiries.forEach((item) => enquirySchema.parse(item))).not.toThrow();
  });

  it("has one gold label for every enquiry without orphan labels", () => {
    const enquiryIds = new Set(syntheticEnquiries.map((item) => item.id));
    const goldIds = new Set(syntheticGoldLabels.map((item) => item.enquiryId));

    expect(goldIds).toEqual(enquiryIds);
  });

  it("splits by company so the 20-case holdout contains unseen clients", () => {
    const splitByCompany = new Map<string, Set<string>>();
    for (const label of syntheticGoldLabels) {
      const companyId = label.enquiryId.split("-").slice(0, 2).join("-");
      const splits = splitByCompany.get(companyId) ?? new Set<string>();
      splits.add(label.split);
      splitByCompany.set(companyId, splits);
    }

    expect(syntheticGoldLabels.filter((item) => item.split === "holdout")).toHaveLength(20);
    expect([...splitByCompany.values()].every((splits) => splits.size === 1)).toBe(true);
  });
});
