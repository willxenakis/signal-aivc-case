import { describe, expect, it, vi } from "vitest";

import {
  LocalEvidenceClassifier,
  ResilientEvidenceClassifier,
  type EvidenceClassifier,
} from "@/domain/classifier";
import { triageEnquiry } from "@/domain/pipeline";
import type { CompanyResearchProvider } from "@/domain/research";
import { InMemoryCompanyResearchProvider } from "@/domain/research";
import { decisionPackageSchema } from "@/domain/schemas";
import { makeCompany, makeEnquiry } from "@/test/factories";

describe("triage pipeline", () => {
  it("classifies, grounds, and routes an enquiry end to end", async () => {
    const result = await triageEnquiry({
      enquiry: makeEnquiry(),
      researchProvider: new InMemoryCompanyResearchProvider([makeCompany()]),
      classifier: new LocalEvidenceClassifier(),
      reviewPolicy: "balanced",
    });

    expect(decisionPackageSchema.parse(result)).toEqual(result);
    expect(result.classification.primaryServiceLine).toBe(
      "ai_applications_automation",
    );
    expect(result.evidence.some((item) => item.sourceType === "company_research")).toBe(true);
    expect(result.route.destination.team).toBe("AI Applications & Automation");
  });

  it("does not let company context override an explicit client request", async () => {
    const result = await triageEnquiry({
      enquiry: makeEnquiry({
        description:
          "We explicitly need a customer support agent that drafts replies and summarizes every conversation for our service team.",
      }),
      researchProvider: new InMemoryCompanyResearchProvider([
        makeCompany({
          operatingSignals: [
            "Operates factories with complex production scheduling and asset maintenance",
          ],
        }),
      ]),
      classifier: new LocalEvidenceClassifier(),
      reviewPolicy: "balanced",
    });

    expect(result.classification.primaryServiceLine).toBe(
      "ai_applications_automation",
    );
  });

  it("keeps a clear critical enquiry on the direct team-lead path", async () => {
    const result = await triageEnquiry({
      enquiry: makeEnquiry({
        urgency: "critical",
        description:
          "We need a customer support assistant that drafts replies and summarizes conversations for our service team.",
      }),
      researchProvider: new InMemoryCompanyResearchProvider([makeCompany()]),
      classifier: new LocalEvidenceClassifier(),
      reviewPolicy: "balanced",
    });

    expect(result.route.status).toBe("auto_routed");
    expect(result.route.priority).toBe("immediate");
    expect(result.route.destination.lead).toBe("Maya Chen");
  });

  it("continues with intake-only evidence when optional research is unavailable", async () => {
    const unavailableProvider: CompanyResearchProvider = {
      async research() {
        throw new Error("search timeout");
      },
    };

    const result = await triageEnquiry({
      enquiry: makeEnquiry({
        description:
          "We need a customer support assistant that drafts replies and summarizes conversations for our service team.",
      }),
      researchProvider: unavailableProvider,
      classifier: new LocalEvidenceClassifier(),
      reviewPolicy: "balanced",
    });

    expect(result.researchStatus).toBe("unavailable");
    expect(result.route.status).toBe("auto_routed");
    expect(result.route.reviewReasons).not.toContain("research_provider_error");
    expect(result.evidence.every((item) => item.sourceType === "intake")).toBe(true);
  });

  it("falls back safely when a live classifier fails", async () => {
    const providerError = Object.assign(
      new Error(
        "Payment required for Bearer sk-live-secret and alex@northstar.example",
      ),
      {
        name: "GatewayError",
        statusCode: 402,
        code: "payment_required",
      },
    );
    const failingClassifier: EvidenceClassifier = {
      async classify() {
        throw providerError;
      },
    };
    const classifier = new ResilientEvidenceClassifier(
      failingClassifier,
      new LocalEvidenceClassifier(),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const result = await triageEnquiry({
        enquiry: makeEnquiry(),
        researchProvider: new InMemoryCompanyResearchProvider([makeCompany()]),
        classifier,
        reviewPolicy: "balanced",
      });

      expect(result.provenance.mode).toBe("fallback");
      expect(result.route.status).toBe("needs_review");
      expect(result.route.reviewReasons).toContain("ai_provider_error");
      expect(errorSpy).toHaveBeenCalledTimes(1);

      const loggedDetails = errorSpy.mock.calls[0]?.[1];
      expect(loggedDetails).toMatchObject({
        name: "GatewayError",
        statusCode: 402,
        code: "payment_required",
      });
      expect(JSON.stringify(loggedDetails)).not.toContain("sk-live-secret");
      expect(JSON.stringify(loggedDetails)).not.toContain(
        "alex@northstar.example",
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
