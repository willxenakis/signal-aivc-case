# Live-model terminal evaluation

The `eval:ai` package runs the real evidence classifier over labeled cases from the terminal. It is intentionally separate from the web app's resilient execution path:

- **Application path:** a provider failure safely falls back and forces review.
- **Evaluation path:** fallback is disabled, because a baseline prediction would contaminate live-model metrics.

## Credential types

An OpenAI API key and a Vercel AI Gateway key are not interchangeable.

| Provider option | Credential | Default model |
| --- | --- | --- |
| `openai` | `OPENAI_API_KEY` or `--api-key` containing a direct OpenAI key | `gpt-5.6-terra` |
| `gateway` | `AI_GATEWAY_API_KEY` or `--api-key` containing a Gateway key | `openai/gpt-5.6-terra` |

The direct provider uses the OpenAI Responses API through `@ai-sdk/openai`. The Gateway provider uses the AI SDK's explicit `createGateway({ apiKey })` configuration.

## Recommended invocation

Official OpenAI documentation recommends loading API keys from an environment variable rather than exposing them in client code. The same approach avoids putting the secret in this runner's argument list.

```bash
export OPENAI_API_KEY="your-key"
pnpm eval:ai --provider openai
unset OPENAI_API_KEY
```

For Vercel AI Gateway:

```bash
export AI_GATEWAY_API_KEY="your-gateway-key"
pnpm eval:ai --provider gateway
unset AI_GATEWAY_API_KEY
```

The requested parameter form is also supported:

```bash
pnpm eval:ai --provider openai --api-key "$OPENAI_API_KEY"
pnpm eval:ai --provider gateway --api-key "$AI_GATEWAY_API_KEY"
```

The key is never logged or written into the report, and known key patterns are redacted from provider error messages. However, a literal `--api-key` value can still be visible temporarily in shell history or process inspection; environment lookup is safer.

## Useful runs

Check the selected cases without calling a provider:

```bash
pnpm eval:ai --dry-run
```

The built-in cases are project-authored development fixtures, not a blind validation set. To evaluate a frozen, independently authored set:

```bash
pnpm eval:ai --dry-run --dataset /path/to/frozen-blind-set.json
pnpm eval:ai --provider openai --dataset /path/to/frozen-blind-set.json
```

Use [the example dataset](../evals/blind-set.example.json) as a schema reference only. It is marked development-only and too small for a performance claim.

Run one inexpensive smoke case:

```bash
pnpm eval:ai --provider openai --case CMP-09-ENQ-01
```

Run the default 20-case company-held-out development slice:

```bash
pnpm eval:ai --provider openai
```

Run the 40-case development split or all 60 cases:

```bash
pnpm eval:ai --provider openai --split development
pnpm eval:ai --provider openai --split all
```

Each report counterfactually scores all three routing policies against the same model predictions. `--policy` selects the route stored on each decision; a second paid model run is not required merely to compare policy:

```bash
pnpm eval:ai --provider openai --policy balanced
```

Choose a model explicitly:

```bash
# Direct OpenAI IDs have no provider prefix
pnpm eval:ai --provider openai --model gpt-5.6-terra

# Gateway IDs require provider/model format
pnpm eval:ai --provider gateway --model openai/gpt-5.6-terra
```

Write to a known location:

```bash
pnpm eval:ai --provider openai --output artifacts/evaluations/terra-holdout.json
```

Show every option:

```bash
pnpm eval:ai --help
```

## Report contents

Reports are written with owner-only file permissions where supported and contain no credential value. Each report records:

- provider, model, split, routing policy, and confirmation that fallback was disabled;
- dataset provenance and plain-language limitations such as structural leakage, insufficient coverage, or labels that were not independently authored;
- attempted, successful, and failed calls;
- provider success rate;
- end-to-end classification accuracy, where provider failures count against the denominator;
- service-line accuracy and macro F1, exact complexity accuracy, auto-route precision, automation coverage, review capture, review precision, and unnecessary-review rate;
- evidence validity among successful calls and across all attempted cases;
- average and p95 model latency;
- input and output token totals;
- every successful decision package for error analysis;
- categorized, redacted errors for failed cases.

Provider failures cause exit status `1`, making authentication, quota, rate-limit, timeout, or structured-output problems visible in CI. Semantic misclassifications remain valid completed evaluations and are reported in the metrics rather than changing the process exit status.

## Suggested evaluation sequence

1. Run `--dry-run --limit 1` to confirm selection.
2. Run a single company-held-out development case and inspect its evidence package.
3. Use the built-in cases only for development and regression.
4. Freeze an independently authored and adjudicated blind set before the final run.
5. Repeat the same model at least three times to measure output stability.
6. Run competing models over the identical cases.
7. Compare provider success, service-line accuracy, macro F1, complexity accuracy, selective routing precision, evidence validity, latency, and token usage.

Do not compare one model's development results with another model's blind results. Keep dataset, prompt, taxonomy, and routing policy fixed for a fair comparison.
