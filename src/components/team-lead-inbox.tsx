"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSearch,
  Layers3,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ClientIntakeRecord } from "@/components/client-intake-record";
import { validateEvidencePackage } from "@/domain/evidence";
import {
  SERVICE_LINE_LABELS,
  type DecisionPackage,
} from "@/domain/schemas";

export type Complexity = DecisionPackage["classification"]["complexity"];

type TeamLeadInboxProps = {
  decisions: DecisionPackage[];
  selectedId: string;
  analystReviewedIds: string[];
  acceptedIds: string[];
  adjustedComplexity: Record<string, Complexity>;
  onSelect: (decisionId: string) => void;
  onAccept: (decision: DecisionPackage, complexity: Complexity, note: string) => void;
  onReturn: (decision: DecisionPackage, note: string) => void;
};

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

export function TeamLeadInbox({
  decisions,
  selectedId,
  analystReviewedIds,
  acceptedIds,
  adjustedComplexity,
  onSelect,
  onAccept,
  onReturn,
}: TeamLeadInboxProps) {
  const leads = useMemo(
    () => [...new Set(decisions.map((decision) => decision.route.destination.lead))].sort(),
    [decisions],
  );
  const [leadFilter, setLeadFilter] = useState("all");
  const [query, setQuery] = useState("");
  const selected = decisions.find((decision) => decision.id === selectedId) ?? decisions[0];
  const [complexity, setComplexity] = useState<Complexity>(
    selected ? adjustedComplexity[selected.id] ?? selected.classification.complexity : "moderate",
  );
  const [note, setNote] = useState("");
  const filtered = decisions.filter((decision) => {
    const matchesLead = leadFilter === "all" || decision.route.destination.lead === leadFilter;
    const normalized = `${decision.enquiry.id} ${decision.enquiry.description} ${decision.route.destination.team}`.toLowerCase();
    return matchesLead && normalized.includes(query.toLowerCase());
  });

  function selectDecision(decision: DecisionPackage) {
    onSelect(decision.id);
    setComplexity(adjustedComplexity[decision.id] ?? decision.classification.complexity);
    setNote("");
  }

  function downloadDecision(decision: DecisionPackage) {
    const blob = new Blob([JSON.stringify(decision, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${decision.id.toLowerCase()}-handoff.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!selected) {
    return (
      <main className="role-page role-page-empty">
        <div className="empty-state-icon"><ClipboardCheck size={24} /></div>
        <span className="eyebrow">Team-lead inbox</span>
        <h1>No decision packages are ready.</h1>
        <p>Cases appear here after a clear automatic route or an analyst resolution.</p>
      </main>
    );
  }

  const evidenceErrors = validateEvidencePackage(selected);
  const isAccepted = acceptedIds.includes(selected.id);
  const analystReviewed = analystReviewedIds.includes(selected.id);
  const serviceEvidence = selected.evidence.filter((item) => item.supports.includes("service_line"));
  const complexityEvidence = selected.evidence.filter((item) => item.supports.includes("complexity"));

  return (
    <main className="role-page">
      <header className="role-heading">
        <div>
          <span className="eyebrow">Team-lead workspace</span>
          <h1>Review decision-ready enquiries.</h1>
          <p>Confirm scope with the routing evidence and unresolved questions in one place.</p>
        </div>
        <label className="lead-filter">
          <span>Viewing</span>
          <select value={leadFilter} onChange={(event) => setLeadFilter(event.target.value)}>
            <option value="all">All team leads</option>
            {leads.map((lead) => <option key={lead} value={lead}>{lead}</option>)}
          </select>
        </label>
      </header>

      <div className="role-workspace">
        <section className="case-list-panel">
          <label className="workspace-search">
            <Search size={15} />
            <span className="sr-only">Search team-lead inbox</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assigned enquiries" />
          </label>
          <div className="case-list" aria-label="Team lead enquiry inbox">
            {filtered.map((decision) => (
              <button
                className={`case-list-item ${decision.id === selected.id ? "selected" : ""}`}
                key={decision.id}
                onClick={() => selectDecision(decision)}
              >
                <span className="case-monogram">{decision.route.destination.lead.split(" ").map((part) => part[0]).join("")}</span>
                <span className="case-list-copy">
                  <span>{decision.enquiry.id}</span>
                  <strong>{decision.route.destination.team}</strong>
                  <small>{decision.enquiry.description}</small>
                </span>
                {acceptedIds.includes(decision.id) ? <CheckCircle2 className="accepted-icon" size={15} /> : <Send size={15} />}
              </button>
            ))}
          </div>
        </section>

        <section className="decision-console lead-console">
          <div className="console-title-row">
            <div>
              <span className="eyebrow">{selected.enquiry.id} · {selected.route.priority} priority</span>
              <h2>{selected.route.destination.team}</h2>
              <p>Assigned to {selected.route.destination.lead}</p>
            </div>
            <div className="console-header-actions">
              <span className="readiness-chip clear"><Check size={13} /> {analystReviewed ? "Analyst resolved" : "Direct route"}</span>
              <button className="icon-button" onClick={() => downloadDecision(selected)} title="Download handoff package"><Download size={16} /><span className="sr-only">Download handoff package</span></button>
            </div>
          </div>

          <ClientIntakeRecord enquiry={selected.enquiry} />

          <div className="model-summary">
            <strong>AI-generated summary</strong>
            <p>{selected.classification.summary}</p>
          </div>

          <div className="decision-steps">
            <article className="decision-step-card">
              <span className="step-number">1</span>
              <div>
                <span className="eyebrow">Service-line route</span>
                <h3>{SERVICE_LINE_LABELS[selected.classification.primaryServiceLine]}</h3>
                <p>Complexity does not change this owner.</p>
                <div className="evidence-snippets">
                  {serviceEvidence.map((evidence) => <span key={evidence.id}>{evidence.excerpt}</span>)}
                </div>
              </div>
            </article>
            <article className="decision-step-card complexity-step">
              <span className="step-number">2</span>
              <div>
                <span className="eyebrow">Complexity guidance</span>
                <h3>{pretty(adjustedComplexity[selected.id] ?? selected.classification.complexity)}</h3>
                <p>{selected.classification.missingInformation.length > 0 ? "Open scoping questions remain." : "No critical scoping gap was identified."}</p>
                <div className="evidence-snippets">
                  {complexityEvidence.map((evidence) => <span key={evidence.id}>{evidence.excerpt}</span>)}
                </div>
              </div>
            </article>
          </div>

          <div className="lead-detail-grid">
            <article className="console-card">
              <div className="console-card-heading"><ShieldCheck size={16} /><strong>Evidence provenance</strong></div>
              <div className="provenance-list">
                {selected.evidence.map((evidence) => (
                  <div key={evidence.id}>
                    <span className={`importance-dot ${evidence.importance}`} />
                    <div><strong>{evidence.sourceType === "intake" ? "Client intake" : "Optional company context"}</strong><small>{evidence.sourceRef} · {evidence.importance}</small></div>
                  </div>
                ))}
              </div>
              <p className={evidenceErrors.length ? "integrity-warning" : "integrity-ok"}>
                {evidenceErrors.length ? `${evidenceErrors.length} evidence reference issue(s) require attention.` : "All evidence references resolve to supplied sources."}
              </p>
            </article>
            <article className="console-card">
              <div className="console-card-heading"><FileSearch size={16} /><strong>Clarify next</strong></div>
              {selected.classification.missingInformation.length ? (
                <ul className="question-list">{selected.classification.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : <p>No material information gap was identified during intake.</p>}
              {selected.route.destination.consultingTeams.length > 0 && <p className="consulting-banner"><b>Consult:</b> {selected.route.destination.consultingTeams.join(", ")}</p>}
            </article>
          </div>

          <article className="lead-action-card">
            <div className="console-card-heading"><Layers3 size={16} /><strong>Team-lead decision</strong></div>
            {isAccepted ? (
              <div className="accepted-state"><CheckCircle2 size={20} /><div><strong>Handoff accepted</strong><span>The decision has been captured as feedback.</span></div></div>
            ) : (
              <>
                <div className="lead-action-grid">
                  <label><span>Confirmed complexity</span><select value={complexity} onChange={(event) => setComplexity(event.target.value as Complexity)}><option value="simple">Simple</option><option value="moderate">Moderate</option><option value="complex">Complex</option></select></label>
                  <label><span>Decision note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional scoping context or reason for a change…" rows={3} /></label>
                </div>
                <div className="lead-action-buttons">
                  <button className="button button-ghost danger-text" onClick={() => onReturn(selected, note)}><ArrowLeft size={15} /> Return to analyst</button>
                  <button className="button button-primary" onClick={() => onAccept(selected, complexity, note)}><Check size={15} /> Accept handoff</button>
                </div>
              </>
            )}
          </article>

          <footer className="assumption-note"><strong>Prototype assumption:</strong> each service line maps directly to one team lead. Complexity changes scoping and evidence—not the assigned lead. Production routing would validate geography, capacity, specialization, and account ownership.</footer>
        </section>
      </div>
    </main>
  );
}
