import { AiEvidenceClassifier } from "@/ai/ai-classifier";
import {
  LocalEvidenceClassifier,
  ResilientEvidenceClassifier,
  type EvidenceClassifier,
} from "@/domain/classifier";

export const DEFAULT_AI_MODEL = "openai/gpt-5.6-terra" as const;

const unavailableClassifier: EvidenceClassifier = {
  async classify() {
    throw new Error("AI Gateway credentials are unavailable");
  },
};

export function createClassifier(mode: "baseline" | "ai") {
  const baseline = new LocalEvidenceClassifier();
  if (mode === "baseline") return baseline;

  const hasGatewayAuthentication = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );
  const primary = hasGatewayAuthentication
    ? new AiEvidenceClassifier({
        model: DEFAULT_AI_MODEL,
        providerName: "vercel-ai-gateway",
        modelName: DEFAULT_AI_MODEL,
      })
    : unavailableClassifier;

  return new ResilientEvidenceClassifier(primary, baseline);
}
