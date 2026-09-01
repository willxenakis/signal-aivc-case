# Evaluation protocol

## Controlling input contract

The case brief promises four substantive inbound fields:

1. short free-text description of the client need;
2. industry;
3. company size; and
4. urgency.

The evaluated classifier receives exactly those four intake fields. Contact name, sender email, company name, internal enquiry ID, and timestamp are operational metadata and are excluded from the model-facing intake payload. Sender domain is an explicit prototype assumption used only by the separate company-research adapter; the brief does not guarantee it.

The primary required outputs are service line, complexity (`simple`, `moderate`, or `complex`), and deterministic team-lead routing. Company enrichment is evaluated separately so it cannot become a hidden answer key.

## Why the built-in dataset cannot validate the model

The 60 built-in cases were created from one five-request-per-company seed matrix. Gold labels and complexity were then derived from seed position and rules. A company split prevents company-name overlap, but it repeats the same request structure. The automated audit currently finds that 96.7% of service-line labels can be predicted from enquiry ordinal alone.

Accordingly, the built-in set is restricted to:

- unit and regression testing;
- user-interface demonstrations;
- prompt and schema debugging; and
- failure-mode exploration.

It must not support a claim that a model exceeds 90% or is ready for production.

## Blind-set construction

1. Freeze the service taxonomy and complexity rubric before creating test cases.
2. Have a scenario author who is not tuning the classifier write realistic submissions using only the four brief fields. Include terse, noisy, ambiguous, multi-service, contradictory, and incomplete requests—not six perfectly balanced templates.
3. Have two reviewers independently label service line, complexity, and whether the initial route genuinely requires human review. They should not see model output or seed intent.
4. Adjudicate disagreements and preserve the disagreement record. Low inter-rater agreement is a taxonomy problem, not a model problem.
5. Include at least 60 cases, at least five examples for every service line, and at least five examples for every complexity level. A larger set is preferable because a 20-case score has very wide uncertainty.
6. Set `purpose` to `blind_evaluation`, `independentLabels` to `true`, and record `frozenAt`. Do not inspect blind results and then tune the prompt, routing thresholds, labels, or cases.
7. If the blind gate fails, return to the development set, create a new future blind set, and document the failed attempt. Do not recycle the revealed test set as blind.

The terminal runner accepts this set with `--dataset /path/to/frozen-blind-set.json`. The checked-in [example](../evals/blind-set.example.json) documents the schema but remains a small development example rather than validation evidence.

## Complexity rubric

- **Simple:** one bounded outcome, one main stakeholder group, limited data or integration dependency, and no material regulatory or operational risk.
- **Moderate:** a bounded service line with multiple stakeholders, some integration or data dependency, or meaningful change-management needs.
- **Complex:** enterprise or multi-function scope, several material systems, cross-service delivery, real-time or optimization constraints, or a regulated/high-stakes deployment.

Company size and urgency affect staffing and priority but do not automatically determine complexity.

## Acceptance criteria

| Measure | Blind-set target | Guardrail |
| --- | ---: | --- |
| Primary service-line accuracy | >90% | Also report macro F1 and every service-line recall |
| Macro F1 | >90% | Prevent class balance from hiding a weak service line |
| Exact complexity accuracy | >90% | Use adjudicated rubric labels |
| Auto-route precision | >=95% | Report `N/A`, not zero, if nothing is automated |
| Automation coverage | Report and target >=70% | Prevent review-everything behavior |
| Review capture | >=90% | Pair with review precision and unnecessary-review rate |
| Evidence-reference validity | 100% | Structural validity does not prove factual correctness |
| Provider success | >=99% | Provider failures count against end-to-end results |

Report the raw numerator/denominator and a confidence interval with percentages. A score over 90% on a small set is not strong evidence by itself.

## Enrichment ablation

Run the frozen cases first using only the four inbound fields. Then run a paired enrichment experiment where company context is produced independently of the gold labels.

Compare:

- service-line and complexity change rate;
- cases improved and cases harmed;
- research coverage and source freshness;
- unsupported-fact rate;
- latency and cost; and
- whether research ever overrides an explicit client request.

Enrichment should improve context, complexity, and consultation recommendations. It should not be allowed to silently replace the client's stated need or inflate apparent accuracy by repeating the label language.
