"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileWarning,
  Inbox,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ClientIntakeRecord } from "@/components/client-intake-record";
import { validateEvidencePackage } from "@/domain/evidence";
import { applyRoutingPolicy } from "@/domain/routing";
import {
  SERVICE_LINES,
  SERVICE_LINE_LABELS,
  type DecisionPackage,
  type ReviewPolicy,
  type ServiceLine,
} from "@/domain/schemas";

type AnalystWorkspaceProps = {
  decisions: DecisionPackage[];
  selectedId: string;
  reviewPolicy: ReviewPolicy;
  onSelect: (decisionId: string) => void;
  onResolve: (decision: DecisionPackage, serviceLine: ServiceLine, note: string) => void;
  onOpenLeadInbox: () => void;
};

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

function monogram(decision: DecisionPackage) {
  if (decision.company.name === "Company identity not supplied") return "IN";
  return decision.company.name.split(" ").slice(0, 2).map((word) => word[0]).join("");
}

export function AnalystWorkspace({
  decisions,
  selectedId,
  reviewPolicy,
  onSelect,
  onResolve,
  onOpenLeadInbox,
}: AnalystWorkspaceProps) {
  const [query, setQuery] = useState("");
  const selected = decisions.find((decision) => decision.id === selectedId) ?? decisions[0];
  const [serviceLine, setServiceLine] = useState<ServiceLine>(
    selected?.classification.primaryServiceLine ?? "ai_strategy_value",
  );
  const [note, setNote] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return decisions.filter((decision) =>
      `${decision.enquiry.id} ${decision.enquiry.description} ${decision.route.destination.team}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [decisions, query]);

  function selectDecision(decision: DecisionPackage) {
    onSelect(decision.id);
    setServiceLine(decision.classification.primaryServiceLine);
    setNote("");
  }

  if (!selected) {
    return (
      <main className="role-page role-page-empty">
        <div className="empty-state-icon"><CheckCircle2 size={24} /></div>
        <span className="eyebrow">Junior analyst queue</span>
        <h1>No routing exceptions are waiting.</h1>
        <p>Clear service-line decisions bypass this queue and go directly to the responsible team lead.</p>
        <button className="button button-secondary" onClick={onOpenLeadInbox}>Open team-lead inbox <ArrowRight size={15} /></button>
      </main>
    );
  }

  const evidenceErrors = validateEvidencePackage(selected);
  const correctedDecision: DecisionPackage = {
    ...selected,
    classification: {
      ...selected.classification,
      primaryServiceLine: serviceLine,
      secondaryServiceLine:
        selected.classification.secondaryServiceLine === serviceLine
          ? null
          : selected.classification.secondaryServiceLine,
    },
  };
  const proposedRoute = applyRoutingPolicy(correctedDecision, reviewPolicy);

  return (
    <main className="role-page">
      <header className="role-heading">
        <div>
          <span className="eyebrow">Junior analyst workspace</span>
          <h1>Resolve routing exceptions.</h1>
          <p>Only ambiguous or invalid routing decisions require analyst attention.</p>
        </div>
        <div className="role-count"><Inbox size={17} /><strong>{decisions.length}</strong><span>waiting</span></div>
      </header>

      <div className="role-workspace">
        <section className="case-list-panel">
          <label className="workspace-search">
            <Search size={15} />
            <span className="sr-only">Search analyst queue</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exceptions" />
          </label>
          <div className="case-list" aria-label="Analyst exception queue">
            {filtered.map((decision) => (
              <button
                className={`case-list-item ${decision.id === selected.id ? "selected" : ""}`}
                key={decision.id}
                onClick={() => selectDecision(decision)}
              >
                <span className="case-monogram">{monogram(decision)}</span>
                <span className="case-list-copy">
                  <span>{decision.enquiry.id}</span>
                  <strong>{SERVICE_LINE_LABELS[decision.classification.primaryServiceLine]}</strong>
                  <small>{decision.enquiry.description}</small>
                </span>
                <CircleAlert size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="decision-console">
          <div className="console-title-row">
            <div>
              <span className="eyebrow">{selected.enquiry.id}</span>
              <h2>Routing decision review</h2>
            </div>
            <span className="readiness-chip review"><CircleAlert size={13} /> Analyst review</span>
          </div>

          <ClientIntakeRecord enquiry={selected.enquiry} />

          <div className="review-grid">
            <article className="console-card">
              <div className="console-card-heading"><FileWarning size={16} /><strong>Why it stopped</strong></div>
              <div className="reason-list">
                {[...selected.route.reviewReasons, ...evidenceErrors].map((reason) => (
                  <span key={reason}>{pretty(reason)}</span>
                ))}
              </div>
              {selected.route.reviewReasons.length === 0 && evidenceErrors.length === 0 && (
                <p>No mechanical failure was recorded; confirm whether the competing service lines are genuinely indistinguishable.</p>
              )}
            </article>
            <article className="console-card">
              <div className="console-card-heading"><ShieldCheck size={16} /><strong>Proposed route</strong></div>
              <strong className="large-value">{SERVICE_LINE_LABELS[selected.classification.primaryServiceLine]}</strong>
              <span>{selected.route.destination.lead}</span>
              {selected.classification.alternatives.map((alternative) => (
                <p key={alternative.serviceLine}><b>Alternative:</b> {SERVICE_LINE_LABELS[alternative.serviceLine]} — {alternative.reason}</p>
              ))}
            </article>
          </div>

          <article className="console-card">
            <div className="console-card-heading"><MessageSquareText size={16} /><strong>Decision factors and evidence</strong></div>
            <div className="factor-list">
              {selected.classification.decisionFactors.map((factor) => (
                <div key={`${factor.label}-${factor.evidenceIds.join("-")}`}>
                  <span className={`importance-dot ${factor.importance}`} />
                  <div><strong>{factor.label}</strong><small>{factor.importance} · {factor.evidenceIds.join(", ")}</small></div>
                </div>
              ))}
            </div>
          </article>

          <article className="analyst-action-card">
            <div className="console-card-heading"><UserRoundCheck size={16} /><strong>Resolve and hand off</strong></div>
            <div className="resolution-grid">
              <label>
                <span>Correct service line</span>
                <select value={serviceLine} onChange={(event) => setServiceLine(event.target.value as ServiceLine)}>
                  {SERVICE_LINES.map((item) => <option key={item} value={item}>{SERVICE_LINE_LABELS[item]}</option>)}
                </select>
              </label>
              <label>
                <span>Analyst rationale</span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain why this is the defensible primary route…" rows={3} />
              </label>
            </div>
            <div className="resolution-preview">
              <span>Destination after review</span>
              <strong>{proposedRoute.destination.team} → {proposedRoute.destination.lead}</strong>
            </div>
            <button
              className="button button-primary"
              disabled={note.trim().length < 3}
              onClick={() => onResolve(selected, serviceLine, note.trim())}
            >
              Route to team lead <ArrowRight size={15} />
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}
