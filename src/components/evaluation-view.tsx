"use client";

import {
  Beaker,
  Check,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  FileWarning,
  FlaskConical,
} from "lucide-react";
import { useMemo, useState } from "react";

import blindDataset from "../../evals/blind-set.json";
import { blindEvaluationRun } from "@/data/blind-evaluation-run";
import { SERVICE_LINE_LABELS } from "@/domain/schemas";

type EvaluationFilter = "all" | "complexity" | "review" | "evidence";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

export function EvaluationView() {
  const [filter, setFilter] = useState<EvaluationFilter>("all");
  const [selectedId, setSelectedId] = useState<string>(blindEvaluationRun.cases[0]?.enquiryId ?? "");
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const filteredCases = useMemo(() => blindEvaluationRun.cases.filter((item) => {
    if (filter === "complexity") return !item.complexityCorrect;
    if (filter === "review") return item.expectedReview !== item.predictedReview;
    if (filter === "evidence") return item.evidenceValidationErrors.length > 0;
    return true;
  }), [filter]);
  const selected = filteredCases.find((item) => item.enquiryId === selectedId) ?? filteredCases[0];
  const intake = blindDataset.cases.find((item) => item.id === selected?.enquiryId)?.intake;
  const isRevealed = selected ? revealedIds.includes(selected.enquiryId) : false;
  const metrics = blindEvaluationRun.summary;

  function selectFilter(nextFilter: EvaluationFilter) {
    setFilter(nextFilter);
    setSelectedId("");
  }

  function toggleReveal() {
    if (!selected) return;
    setRevealedIds((current) =>
      current.includes(selected.enquiryId)
        ? current.filter((id) => id !== selected.enquiryId)
        : [...current, selected.enquiryId],
    );
  }

  return (
    <main className="evaluation-page">
      <header className="evaluation-hero">
        <div>
          <span className="eyebrow">Recorded independent evaluation</span>
          <h1>Inspect the blind run without hiding the weaknesses.</h1>
          <p>The labels were independently authored and frozen before this live-model run. Gold outcomes stay hidden until explicitly revealed.</p>
        </div>
        <div className="run-stamp">
          <FlaskConical size={18} />
          <div><strong>{blindEvaluationRun.config.model}</strong><span>{blindEvaluationRun.config.provider} · balanced policy</span></div>
        </div>
      </header>

      <section className="evaluation-metric-grid">
        <article><span>Service-line accuracy</span><strong>{pct(metrics.endToEndClassificationAccuracy)}</strong><small>60 / 60 primary routes</small></article>
        <article className="caution"><span>Complexity accuracy</span><strong>{pct(metrics.endToEndComplexityAccuracy)}</strong><small>46 / 60 scope judgments</small></article>
        <article className="caution"><span>Review capture</span><strong>{pct(metrics.successfulCaseMetrics.reviewCaptureRate)}</strong><small>5 / 6 required reviews</small></article>
        <article><span>Evidence validity</span><strong>{pct(metrics.endToEndEvidenceValidity)}</strong><small>57 / 60 reference-valid</small></article>
      </section>

      <section className="evaluation-story">
        <div className="evaluation-callout">
          <Check size={18} />
          <div><strong>The primary routing objective performed well.</strong><span>That does not mean the entire system was 100% accurate: complexity, review policy, and evidence provenance still failed on meaningful cases.</span></div>
        </div>
        <div className="run-facts">
          <span><Clock3 size={14} /> {Math.round(metrics.latency.averageMs).toLocaleString()} ms average</span>
          <span><Beaker size={14} /> {metrics.attempted} provider calls</span>
          <span><FileWarning size={14} /> {blindEvaluationRun.cases.filter((item) => item.evidenceValidationErrors.length > 0).length} evidence failures</span>
        </div>
      </section>

      <section className="blind-explorer">
        <div className="explorer-sidebar">
          <div className="evaluation-filters" aria-label="Blind case filters">
            {([
              ["all", "All 60"],
              ["complexity", "Complexity misses"],
              ["review", "Review misses"],
              ["evidence", "Evidence failures"],
            ] as const).map(([value, label]) => (
              <button className={filter === value ? "active" : ""} key={value} onClick={() => selectFilter(value)}>{label}</button>
            ))}
          </div>
          <div className="evaluation-case-list">
            {filteredCases.map((item) => (
              <button className={selected?.enquiryId === item.enquiryId ? "selected" : ""} key={item.enquiryId} onClick={() => setSelectedId(item.enquiryId)}>
                <span>{item.enquiryId}</span>
                <strong>{SERVICE_LINE_LABELS[item.predictedServiceLine]}</strong>
                <small>
                  {!item.complexityCorrect && <span>Complexity</span>}
                  {item.expectedReview !== item.predictedReview && <span>Review</span>}
                  {item.evidenceValidationErrors.length > 0 && <span>Evidence</span>}
                  {item.complexityCorrect && item.expectedReview === item.predictedReview && item.evidenceValidationErrors.length === 0 && <span className="pass">Pass</span>}
                </small>
              </button>
            ))}
          </div>
        </div>

        {selected && intake && (
          <article className="blind-case-detail">
            <div className="blind-case-header">
              <div><span className="eyebrow">{selected.enquiryId}</span><h2>Blind case inspection</h2></div>
              <button className="button button-secondary" onClick={toggleReveal}>{isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}{isRevealed ? "Hide gold" : "Reveal gold"}</button>
            </div>

            <blockquote>“{intake.description}”</blockquote>
            <dl className="intake-facts">
              <div><dt>Industry</dt><dd>{pretty(intake.industry)}</dd></div>
              <div><dt>Company size</dt><dd>{intake.companySize}</dd></div>
              <div><dt>Urgency</dt><dd>{pretty(intake.urgency)}</dd></div>
              <div><dt>Research</dt><dd>Not supplied</dd></div>
            </dl>

            <div className="prediction-comparison">
              <section>
                <span className="comparison-label">Recorded prediction</span>
                <div><span>Service line</span><strong>{SERVICE_LINE_LABELS[selected.predictedServiceLine]}</strong></div>
                <div><span>Complexity</span><strong>{pretty(selected.predictedComplexity)}</strong></div>
                <div><span>Review</span><strong>{selected.predictedReview ? "Required" : "Direct route"}</strong></div>
              </section>
              <section className={isRevealed ? "gold-revealed" : "gold-hidden"}>
                <span className="comparison-label">Frozen gold label</span>
                {isRevealed ? (
                  <>
                    <div><span>Service line</span><strong>{SERVICE_LINE_LABELS[selected.expectedServiceLine]}</strong></div>
                    <div><span>Complexity</span><strong className={selected.complexityCorrect ? "" : "mismatch"}>{pretty(selected.expectedComplexity)}</strong></div>
                    <div><span>Review</span><strong className={selected.expectedReview === selected.predictedReview ? "" : "mismatch"}>{selected.expectedReview ? "Required" : "Direct route"}</strong></div>
                  </>
                ) : <div className="hidden-label"><EyeOff size={18} /> Hidden to preserve the walkthrough</div>}
              </section>
            </div>

            {selected.evidenceValidationErrors.length > 0 && (
              <div className="case-warning"><CircleAlert size={16} /><div><strong>Evidence validation failed</strong>{selected.evidenceValidationErrors.map((error) => <span key={error}>{error}</span>)}</div></div>
            )}
          </article>
        )}
      </section>

      <footer className="evaluation-footer-note"><strong>Enrichment boundary:</strong> this blind set contains only the four brief-supplied intake fields. Company research was intentionally excluded, so these results do not claim external-enrichment performance.</footer>
    </main>
  );
}
