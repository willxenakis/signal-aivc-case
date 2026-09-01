import { describe, expect, it } from "vitest";

import { parseLiveEvalArgs } from "@/eval/cli-options";

describe("live evaluation CLI options", () => {
  it("accepts a direct OpenAI key parameter without exposing it in public config", () => {
    const parsed = parseLiveEvalArgs(
      ["--provider", "openai", "--api-key", "sk-test", "--limit", "3"],
      {},
    );

    expect(parsed.apiKey).toBe("sk-test");
    expect(parsed.model).toBe("gpt-5.6-terra");
    expect(parsed.limit).toBe(3);
    expect(parsed.credentialSource).toBe("parameter");
    expect(JSON.stringify(parsed.publicConfig)).not.toContain("sk-test");
  });

  it("uses the provider-specific environment variable for Gateway", () => {
    const parsed = parseLiveEvalArgs(
      ["--provider", "gateway"],
      { AI_GATEWAY_API_KEY: "gateway-secret" },
    );

    expect(parsed.apiKey).toBe("gateway-secret");
    expect(parsed.model).toBe("openai/gpt-5.6-terra");
    expect(parsed.credentialSource).toBe("environment");
  });

  it("allows a credential-free dry run", () => {
    const parsed = parseLiveEvalArgs(
      ["--dry-run", "--dataset", "evals/blind.json"],
      {},
    );

    expect(parsed.dryRun).toBe(true);
    expect(parsed.apiKey).toBeNull();
    expect(parsed.datasetPath).toBe("evals/blind.json");
  });

  it("rejects missing credentials and provider-incompatible model slugs", () => {
    expect(() => parseLiveEvalArgs([], {})).toThrow("OPENAI_API_KEY");
    expect(() =>
      parseLiveEvalArgs(
        [
          "--provider",
          "openai",
          "--api-key",
          "sk-test",
          "--model",
          "openai/gpt-5.6-terra",
        ],
        {},
      ),
    ).toThrow("must not include a provider prefix");
    expect(() =>
      parseLiveEvalArgs(
        [
          "--provider",
          "gateway",
          "--api-key",
          "gateway-test",
          "--model",
          "gpt-5.6-terra",
        ],
        {},
      ),
    ).toThrow("provider/model");
  });
});
