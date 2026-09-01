"use client";

import {
  Building2,
  Check,
  CircleAlert,
  Database,
  Download,
  FileSearch,
  Route,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  SERVICE_LINES,
  SERVICE_LINE_LABELS,
  type DecisionPackage,
  type ServiceLine,
} from "@/domain/schemas";

type DecisionDetailProps = {
  decision: DecisionPackage;
  isReviewed: boolean;
  correctedServiceLine?: ServiceLine;
  onApprove: (decision: DecisionPackage) => void;
  onCorrect: (decision: DecisionPackage, serviceLine: ServiceLine) => void;
};

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

export function DecisionDetail({
  decision,
  isReviewed,
  correctedServiceLine,
  onApprove,
  onCorrect,
}: DecisionDetailProps) {
  const [correction, setCorrection] = useState<ServiceLine>(
    correctedServiceLine ?? decision.classification.primaryServiceLine,
  );
  const researchEvidence = useMemo(
    () => decision.evidence.filter((item) => item.sourceType === "company_research"),
    [decision.evidence],
  );

  function downloadDecision() {
    const blob = new Blob([JSON.stringify(decision, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${decision.id.toLowerCase()}-evidence.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <aside className="detail-panel" aria-label="Selected enquiry evidence package">
      <div className="detail-header">
        <div>
          <div className="eyebrow">Decision package</div>
          <h2>{decision.company.name}</h2>
          <p>{decision.enquiry.senderEmail}</p>
        </div>
        <button className="icon-button" onClick={downloadDecision} title="Download evidence package">
          <Download size={17} aria-hidden="true" />
          <span className="sr-only">Download evidence package</span>
        </button>
      </div>

      <div className="detail-badges">
        <span className={`status-chip ${decision.route.status}`}>
          {decision.route.status === "needs_review" ? <CircleAlert size={13} /> : <Check size={13} />}
          {decision.route.status === "needs_review" ? "Review required" : "Safe to route"}
        </span>
        <span className="neutral-chip">{pretty(decision.classification.complexity)}</span>
        <span className="neutral-chip">{pretty(decision.enquiry.urgency)} urgency</span>
      </div>

      <section className="detail-section request-card">
        <div className="section-label">
          <FileSearch size={15} />
          Client request
        </div>
        <blockquote>“{decision.enquiry.description}”</blockquote>
      </section>

      <section className="detail-section decision-summary">
        <div className="section-label">
          <Route size={15} />
          Routing decision
        </div>
        <div className="decision-route">
          <div>
            <span>Primary team</span>
            <strong>{decision.route.destination.team}</strong>
          </div>
          <div>
            <span>Team lead</span>
            <strong>{decision.route.destination.lead}</strong>
          </div>
        </div>
        {decision.route.destination.consultingTeams.length > 0 && (
          <p className="consulting-note">
            Consult: {decision.route.destination.consultingTeams.join(", ")}
          </p>
        )}
      </section>

      <section className="detail-section">
        <div className="section-label">
          <ShieldCheck size={15} />
          Evidence used
          <span>{decision.evidence.length}</span>
        </div>
        <div className="evidence-list">
          {decision.evidence.map((item, index) => (
            <article className="evidence-item" key={item.id}>
              <div className="evidence-meta">
                <span className={`evidence-index ${item.importance}`}>E{index + 1}</span>
                <span>{item.sourceType === "intake" ? "Intake form" : "Company research"}</span>
                <span>{item.importance}</span>
              </div>
              <p>“{item.excerpt}”</p>
              <div className="evidence-supports">
                {item.supports.map((support) => (
                  <span key={support}>{pretty(support)}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-section company-context">
        <div className="section-label">
          <Building2 size={15} />
          Company context
        </div>
        <p>{decision.company.summary}</p>
        <dl>
          <div>
            <dt>Industry</dt>
            <dd>{pretty(decision.company.industry)}</dd>
          </div>
          <div>
            <dt>Employees</dt>
            <dd>{decision.company.employeeBand}</dd>
          </div>
          <div>
            <dt>Identity</dt>
            <dd>{decision.company.identityConfidence}</dd>
          </div>
        </dl>
        <div className="source-stack">
          {decision.company.sources.map((source) => (
            <div className="source-row" key={source.id}>
              <Database size={13} />
              <span>{source.title}</span>
              <small>synthetic · {source.trustTier}</small>
            </div>
          ))}
        </div>
        {researchEvidence.length === 0 && (
          <p className="warning-copy">No external research evidence was available.</p>
        )}
      </section>

      <section className="detail-section">
        <div className="section-label">
          <Route size={15} />
          Route trace
        </div>
        <div className="route-trace">
          {decision.route.rulesApplied.map((rule) => (
            <div key={rule}>
              <span />
              <code>{rule}</code>
            </div>
          ))}
        </div>
        {decision.route.reviewReasons.length > 0 && (
          <div className="review-reasons">
            {decision.route.reviewReasons.map((reason) => (
              <span key={reason}>{pretty(reason)}</span>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section feedback-card">
        <div className="section-label">
          <UserCheck size={15} />
          Human decision
        </div>
        {isReviewed ? (
          <div className="reviewed-state">
            <Check size={18} />
            <div>
              <strong>Reviewed by analyst</strong>
              <span>{correctedServiceLine ? `Corrected to ${SERVICE_LINE_LABELS[correctedServiceLine]}` : "Route approved as proposed"}</span>
            </div>
          </div>
        ) : (
          <>
            <label htmlFor="service-line-correction">Correct service line</label>
            <select
              id="service-line-correction"
              value={correction}
              onChange={(event) => setCorrection(event.target.value as ServiceLine)}
            >
              {SERVICE_LINES.map((serviceLine) => (
                <option key={serviceLine} value={serviceLine}>
                  {SERVICE_LINE_LABELS[serviceLine]}
                </option>
              ))}
            </select>
            <div className="feedback-actions">
              <button className="button button-secondary" onClick={() => onCorrect(decision, correction)}>
                Save correction
              </button>
              <button className="button button-primary" onClick={() => onApprove(decision)}>
                <Check size={15} /> Approve route
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="provenance-footer">
        <span>{decision.provenance.model}</span>
        <span>{decision.provenance.latencyMs} ms</span>
        <span>taxonomy {decision.provenance.taxonomyVersion}</span>
      </footer>
    </aside>
  );
}
