import { parseArgs } from "node:util";

import type { ReviewPolicy } from "@/domain/schemas";

export type LiveEvalProvider = "openai" | "gateway";
export type EvaluationSplit = "development" | "holdout" | "all";

export type LiveEvalPublicConfig = {
  provider: LiveEvalProvider;
  model: string;
  split: EvaluationSplit;
  reviewPolicy: ReviewPolicy;
  limit: number | null;
  caseIds: string[];
  datasetPath: string | null;
  credentialSource: "parameter" | "environment" | "none";
};

export type LiveEvalCliOptions = LiveEvalPublicConfig & {
  apiKey: string | null;
  dryRun: boolean;
  help: boolean;
  outputPath: string;
  publicConfig: LiveEvalPublicConfig;
};

const PROVIDERS = new Set<LiveEvalProvider>(["openai", "gateway"]);
const SPLITS = new Set<EvaluationSplit>(["development", "holdout", "all"]);
const POLICIES = new Set<ReviewPolicy>([
  "conservative",
  "balanced",
  "aggressive",
]);

function parsePositiveInteger(value: string | undefined) {
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("--limit must be a positive integer.");
  }
  return parsed;
}

function defaultOutputPath(provider: LiveEvalProvider, model: string) {
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const safeModel = model.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
  return `artifacts/evaluations/${timestamp}-${provider}-${safeModel}.json`;
}

export function parseLiveEvalArgs(
  args: string[],
  environment: Record<string, string | undefined> = process.env,
): LiveEvalCliOptions {
  const { values } = parseArgs({
    args,
    strict: true,
    allowPositionals: false,
    options: {
      provider: { type: "string", default: "openai" },
      "api-key": { type: "string" },
      model: { type: "string" },
      split: { type: "string", default: "holdout" },
      policy: { type: "string", default: "balanced" },
      limit: { type: "string" },
      case: { type: "string", multiple: true },
      dataset: { type: "string" },
      output: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (!PROVIDERS.has(values.provider as LiveEvalProvider)) {
    throw new Error("--provider must be either openai or gateway.");
  }
  if (!SPLITS.has(values.split as EvaluationSplit)) {
    throw new Error("--split must be development, holdout, or all.");
  }
  if (!POLICIES.has(values.policy as ReviewPolicy)) {
    throw new Error("--policy must be conservative, balanced, or aggressive.");
  }

  const provider = values.provider as LiveEvalProvider;
  const split = values.split as EvaluationSplit;
  const reviewPolicy = values.policy as ReviewPolicy;
  const defaultModel =
    provider === "openai" ? "gpt-5.6-terra" : "openai/gpt-5.6-terra";
  const model = values.model ?? defaultModel;

  if (provider === "openai" && model.includes("/")) {
    throw new Error(
      "A direct OpenAI model must not include a provider prefix; use gpt-5.6-terra.",
    );
  }
  if (provider === "gateway" && !model.includes("/")) {
    throw new Error(
      "A Gateway model must use provider/model format, such as openai/gpt-5.6-terra.",
    );
  }

  const environmentKey =
    provider === "openai" ? "OPENAI_API_KEY" : "AI_GATEWAY_API_KEY";
  const parameterKey = values["api-key"]?.trim();
  const environmentValue = environment[environmentKey]?.trim();
  const apiKey = parameterKey || environmentValue || null;
  const credentialSource = parameterKey
    ? "parameter"
    : environmentValue
      ? "environment"
      : "none";
  const dryRun = values["dry-run"];
  const help = values.help;

  if (!apiKey && !dryRun && !help) {
    throw new Error(
      `Missing credential. Pass --api-key or set ${environmentKey}.`,
    );
  }

  const publicConfig: LiveEvalPublicConfig = {
    provider,
    model,
    split,
    reviewPolicy,
    limit: parsePositiveInteger(values.limit),
    caseIds: values.case ?? [],
    datasetPath: values.dataset?.trim() || null,
    credentialSource,
  };

  return {
    ...publicConfig,
    apiKey,
    dryRun,
    help,
    outputPath:
      values.output?.trim() || defaultOutputPath(provider, model),
    publicConfig,
  };
}

export const LIVE_EVAL_HELP = `Signal live-model evaluation

Usage:
  pnpm eval:ai --provider openai --api-key <OPENAI_KEY>
  pnpm eval:ai --provider gateway --api-key <GATEWAY_KEY>

Environment credential usage (preferred):
  Set OPENAI_API_KEY, then run: pnpm eval:ai --provider openai
  Set AI_GATEWAY_API_KEY, then run: pnpm eval:ai --provider gateway

Options:
  --provider <openai|gateway>       Credential/provider type (default: openai)
  --api-key <secret>               API key; never written to the report
  --model <id>                     Direct: gpt-5.6-terra; Gateway: provider/model
  --split <holdout|development|all> Dataset split (default: holdout)
  --policy <name>                  balanced, conservative, or aggressive
  --limit <number>                 Run only the first N selected cases
  --case <enquiry-id>              Run a specific case; may be repeated
  --dataset <path>                 Independently authored evaluation JSON
  --output <path>                  JSON report destination
  --dry-run                        Validate selection without making API calls
  -h, --help                       Show this help

The runner is strict: provider failures are recorded as failures and never
replaced with baseline predictions. A report containing provider failures exits 1.
`;
