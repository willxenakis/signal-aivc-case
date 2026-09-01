import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";

import {
  AiEvidenceClassifier,
  toBriefIntakePayload,
} from "@/ai/ai-classifier";
import { makeCompany, makeDecision, makeEnquiry } from "@/test/factories";

describe("AI evidence classifier adapter", () => {
  it("sends only the four inbound fields promised by the case brief", () => {
    const payload = toBriefIntakePayload(makeEnquiry());

    expect(payload).toEqual({
      description:
        "We want a technician copilot that summarizes maintenance history and drafts the next recommended action.",
      selfReportedIndustry: "manufacturing",
      companySize: "1001-5000",
      urgency: "standard",
    });
    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("contactName");
    expect(payload).not.toHaveProperty("senderEmail");
    expect(payload).not.toHaveProperty("companyName");
    expect(payload).not.toHaveProperty("submittedAt");
  });

  it("validates a structured model response and preserves usage provenance", async () => {
    const fixture = makeDecision();
    const model = new MockLanguageModelV4({
      provider: "test-provider",
      modelId: "test-model",
      doGenerate: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              classification: fixture.classification,
              evidence: fixture.evidence,
            }),
          },
        ],
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: {
            total: 120,
            noCache: 120,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: { total: 80, text: 80, reasoning: undefined },
        },
        warnings: [],
      }),
    });

    const classifier = new AiEvidenceClassifier({
      model,
      providerName: "test-provider",
      modelName: "test-model",
    });
    const result = await classifier.classify(makeEnquiry(), makeCompany());

    expect(result.classification.primaryServiceLine).toBe(
      "ai_applications_automation",
    );
    expect(result.evidence).toHaveLength(2);
    expect(result.provenance.tokenUsage).toEqual({ input: 120, output: 80 });
    expect(result.provenance.mode).toBe("live_ai");
  });

});
