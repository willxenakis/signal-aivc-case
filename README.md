# Signal - evidence-grounded enquiry triage

Signal is a working case-study prototype for a professional services firm receiving 40-60 inbound enquiries per week. It converts a short client intake into a source-grounded decision package, routes clear cases to the appropriate service-line lead, and sends genuine exceptions to a junior analyst.

**Live prototype:** [signal-aivc-case.vercel.app](https://signal-aivc-case.vercel.app/)

## Submission guide

- [Architecture diagram and implementation notes](docs/architecture.md)
- [Production-readiness write-up](docs/production-readiness.md)
- [Evaluation protocol](docs/evaluation-protocol.md)
- [Live-model evaluation instructions](docs/live-ai-evaluation.md)

For a quick walkthrough:

1. Load `BLIND-TXMAQB` to demonstrate a clear route to a team lead.
2. Load `BLIND-Y8DKVE` or `BLIND-G5UHR5` to exercise the analyst-review path.
3. Follow the handoff to inspect the original intake, service-line evidence, complexity evidence, provenance, missing information, and human decision controls.
4. Open **Blind evaluation** to review the recorded 60-case run, including its weaknesses rather than only the headline result.

All companies, people, domains, and enquiries are synthetic. The application has no authentication and stores workflow actions only in the current browser.

## Product decision

A wrong service-line route delays revenue and wastes senior attention, so service-line ownership is the primary automated decision. The core rule is **route first; scope second; a human owns exceptions**:

- clear, evidence-supported service-line decisions go to that team's lead;
- ambiguous classifications, invalid evidence, and live-provider fallback go to a junior analyst;
- complexity is separate guidance for the team lead and never silently changes ownership; and
- external company research is optional context, not a prerequisite for a defensible intake-only route.

The six service lines combine professional consulting and enterprise-AI delivery:

| Service line | Typical enquiries |
| --- | --- |
| AI Strategy & Value | opportunity portfolios, roadmaps, business cases, platform strategy |
| Data & AI Platforms | data integration, semantic layers, MLOps, reusable foundations |
| AI Applications & Automation | copilots, agents, document workflows, custom AI products |
| Decision Intelligence & Operations | forecasting, optimization, scheduling, digital twins |
| AI Governance, Risk & Security | responsible AI, model risk, privacy, controls, auditability |
| Adoption & Operating Model | training, workforce redesign, change, AI operating models |

This taxonomy and its fictional lead assignments are case-study assumptions, not claims about AIVC's current organization.

## End-to-end behavior

```text
web intake -> validate -> optional context -> classify -> validate evidence
           -> deterministic policy -> analyst exception or team-lead handoff
           -> human feedback
```

The public form submits the four substantive fields in the brief to `POST /api/triage`. Zod validates the intake before the classifier runs. The optional hosted path uses `openai/gpt-5.6-terra` through Vercel AI Gateway with schema-constrained output; the no-key baseline uses deterministic evidence rules.

Every result is validated again before deterministic routing. A live provider or structured-output failure invokes the local baseline, records `fallback` provenance, adds `ai_provider_error`, and forces human review. The strict terminal evaluator disables fallback so provider failures cannot be hidden by baseline predictions.

The [architecture document](docs/architecture.md) covers the complete data flow, production integrations, model and API choices, and day-one instrumentation.

## Decision package

The canonical `DecisionPackage` contains:

- the exact original enquiry and available company context;
- primary and secondary service lines, complexity, use case, and missing information;
- evidence excerpts with source references and `decisive`, `supporting`, or `contextual` importance;
- decision factors that resolve to evidence IDs;
- deterministic destination, priority, consulting teams, applied rules, and review reasons; and
- provider, model, latency, tokens, prompt version, taxonomy version, schema version, and timestamp.

Evidence importance describes its role in the explanation. It does not claim access to an LLM's hidden internal weights.

## Recorded evaluation

The final recorded run used `gpt-5.6-terra` on a frozen, separately authored and labeled 60-case synthetic set. Fallback was disabled. The set was blind for that recorded run; its cases are now included for transparent review and demonstration, so it must not be reused as a future blind gate.

| Metric | Result |
| --- | ---: |
| Provider success | 100% |
| Primary service-line accuracy | 100% |
| Macro F1 | 100% |
| Exact complexity accuracy | 76.7% |
| Auto-route precision | 100% |
| Automation coverage | 83.3% |
| Review capture | 83.3% |
| Review precision | 50.0% |
| Unnecessary review rate | 9.3% |
| Evidence-reference validity | 95.0% |
| Latency | 9,040 ms average / 12,759 ms p95 |

The conclusion is not that the entire system is 100% accurate. Service-line classification was strong on this synthetic set, while complexity, review behavior, evidence construction, latency, and validation on anonymized historical data remain open work.

The built-in 60-case seed matrix is separate development data. Its repeated five-request structure makes the service label 96.7% predictable from enquiry position, so it is restricted to unit tests, regression tests, and UI demonstration.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm test
pnpm dev
```

Open `http://localhost:3000`. The deterministic baseline requires no credentials.

For the optional live application path, copy `.env.example` to `.env.local` and configure `AI_GATEWAY_API_KEY`, or use the linked Vercel project's OIDC authentication. Secrets remain server-side.

Quality gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Run a strict live-model evaluation

Environment variables are safer than literal command-line keys because literal arguments may appear in shell history or process inspection.

```bash
# Direct OpenAI
export OPENAI_API_KEY="your-key"
pnpm eval:ai --provider openai --dataset evals/blind-set.json

# Or Vercel AI Gateway
export AI_GATEWAY_API_KEY="your-key"
pnpm eval:ai --provider gateway --dataset evals/blind-set.json
```

Validate selection without spending anything:

```bash
pnpm eval:ai --dry-run --dataset evals/blind-set.json --limit 3
```

The runner makes one real call per case, disables fallback, redacts known credential patterns, records provider failures, and writes an owner-readable JSON report under `artifacts/evaluations/`. See [live-model evaluation instructions](docs/live-ai-evaluation.md) for all options.

## Important code

| Responsibility | Location |
| --- | --- |
| API request validation and classifier selection | [`src/app/api/triage/route.ts`](src/app/api/triage/route.ts) |
| Pipeline orchestration | [`src/domain/pipeline.ts`](src/domain/pipeline.ts) |
| Hosted structured classifier | [`src/ai/ai-classifier.ts`](src/ai/ai-classifier.ts) |
| Local and resilient fallback classifiers | [`src/domain/classifier.ts`](src/domain/classifier.ts) |
| Evidence validation | [`src/domain/evidence.ts`](src/domain/evidence.ts) |
| Deterministic routing policy | [`src/domain/routing.ts`](src/domain/routing.ts) |
| Canonical Zod schemas | [`src/domain/schemas.ts`](src/domain/schemas.ts) |
| Evaluation metrics and runner | [`src/domain/evaluation.ts`](src/domain/evaluation.ts), [`src/eval`](src/eval), [`scripts/run-ai-eval.ts`](scripts/run-ai-eval.ts) |
| Synthetic development fixtures | [`src/data`](src/data) |
| Frozen evaluation set | [`evals/blind-set.json`](evals/blind-set.json) |

## Technology choices

Next.js and TypeScript keep the interface, server route, schemas, and tests in one Vercel deployment. Zod supplies runtime validation and inferred TypeScript types from the same contracts. The Vercel AI SDK provides provider-neutral structured generation. Vitest covers schemas, enrichment boundaries, classification, evidence, routing, fallback, and evaluation behavior.

Python would be a strong addition for notebook-based error analysis, pandas or Polars workflows, batch labeling, statistical confidence intervals, or a separate ML service. It adds an unnecessary second runtime for this prototype's synchronous volume.

`gpt-5.6-terra` is a benchmark candidate rather than an assumed production winner. A longer evaluation would compare OpenAI, Anthropic, Google, lower-cost, and potentially self-hosted candidates on the same frozen data using accuracy, review capture, evidence validity, repeated-run stability, latency, and cost.

## Honest limitations

- Submitted enquiries and human feedback are not durably persisted; workflow actions use browser-local storage.
- Live web submissions currently use intake-only context. The company-research adapter and synthetic registry demonstrate the boundary but do not perform live web research.
- There is no authentication, RBAC, tenant isolation, CRM integration, notification adapter, production PII policy, or operational telemetry.
- The synthetic development set is template-like, and the recorded blind set remains synthetic rather than anonymized historical evidence.
- The current classifier emits an explicit review decision rather than a calibrated numeric confidence score.
- Conservative policy adds broad review conditions. Balanced and aggressive are currently equivalent until a distinct aggressive policy is defined and tested.
- The 60-case recorded run is encouraging evidence, not a production-readiness claim.

The [production-readiness write-up](docs/production-readiness.md) explains what is most likely to fail first, what should be monitored, and how the fallback should operate.

## AI-assisted development disclosure

Codex was used as a pair-programming tool for interpretation, implementation, tests, documentation, and browser verification. Human direction established the product requirements, evidence and routing philosophy, synthetic-first TDD approach, taxonomy, evaluation separation, and acceptance criteria. Generated code or labels were not treated as proof of correctness; schemas, tests, builds, a strict provider evaluation, and manual review were used as evidence.
