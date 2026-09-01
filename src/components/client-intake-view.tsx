"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  INDUSTRIES,
  SERVICE_LINE_LABELS,
  type DecisionPackage,
  type Enquiry,
  type Industry,
  type ReviewPolicy,
} from "@/domain/schemas";

export type DemoIntakeCase = {
  id: string;
  intake: {
    description: string;
    industry: Industry;
    companySize: Enquiry["companySize"];
    urgency: Enquiry["urgency"];
  };
};

type ClientIntakeViewProps = {
  demoCases: DemoIntakeCase[];
  reviewPolicy: ReviewPolicy;
  onCreated: (decision: DecisionPackage) => void;
  onOpenInternalView: (view: "analyst" | "lead") => void;
};

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

export function ClientIntakeView({
  demoCases,
  reviewPolicy,
  onCreated,
  onOpenInternalView,
}: ClientIntakeViewProps) {
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState<Industry>("unknown");
  const [companySize, setCompanySize] = useState<Enquiry["companySize"]>("251-1000");
  const [urgency, setUrgency] = useState<Enquiry["urgency"]>("standard");
  const [selectedDemoId, setSelectedDemoId] = useState(demoCases[0]?.id ?? "");
  const [decision, setDecision] = useState<DecisionPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadDemoCase() {
    const demoCase = demoCases.find((item) => item.id === selectedDemoId);
    if (!demoCase) return;
    setDescription(demoCase.intake.description);
    setIndustry(demoCase.intake.industry);
    setCompanySize(demoCase.intake.companySize);
    setUrgency(demoCase.intake.urgency);
    setDecision(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setDecision(null);

    const enquiryId = selectedDemoId && demoCases.some((item) => item.id === selectedDemoId && item.intake.description === description)
      ? selectedDemoId
      : `WEB-${Date.now()}`;
    const enquiry: Enquiry = {
      id: enquiryId,
      contactName: "Not supplied",
      senderEmail: `case-${enquiryId.toLowerCase()}@brief-intake.invalid`,
      companyName: "Company identity not supplied",
      description,
      selfReportedIndustry: industry,
      companySize,
      urgency,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry, reviewPolicy }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result === "object" && result && "message" in result
            ? String(result.message)
            : "We could not submit this enquiry.",
        );
      }
      const created = result as DecisionPackage;
      setDecision(created);
      onCreated(created);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit this enquiry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="client-page">
      <section className="client-hero">
        <div className="public-brand">
          <span className="brand-mark">S</span>
          <div><strong>Signal</strong><span>Enquiry routing</span></div>
        </div>
        <div className="client-hero-copy">
          <span className="eyebrow">New enquiry</span>
          <h1>Tell us what you need help solving.</h1>
          <p>
            Share the desired outcome and known constraints. We’ll route the request to the right specialist team.
          </p>
        </div>
      </section>

      <section className="intake-column">
        <div className="demo-loader" aria-label="Interview demo controls">
          <div>
            <span className="eyebrow">Interview demo</span>
            <strong>Load a frozen blind case</strong>
            <small>The expected label remains hidden in this client view.</small>
          </div>
          <div className="demo-loader-controls">
            <label>
              <span className="sr-only">Blind case</span>
              <select value={selectedDemoId} onChange={(event) => setSelectedDemoId(event.target.value)}>
                {demoCases.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={14} />
            </label>
            <button className="button button-secondary" onClick={loadDemoCase} type="button">Load case</button>
          </div>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <span className="eyebrow">Enquiry details</span>
              <h2>Describe the request</h2>
            </div>
            <span>All fields required</span>
          </div>

          <label className="form-field form-field-wide" htmlFor="description">
            <span>Describe the enquiry</span>
            <small>Include the desired outcome and any material constraints you already know.</small>
            <textarea
              id="description"
              minLength={20}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="For example: We need to reduce manual claims review while preserving human approval for exceptions…"
              required
              rows={7}
              value={description}
            />
          </label>

          <div className="intake-form-grid">
            <label className="form-field" htmlFor="industry">
              <span>Industry</span>
              <select id="industry" value={industry} onChange={(event) => setIndustry(event.target.value as Industry)}>
                {INDUSTRIES.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
              </select>
            </label>
            <label className="form-field" htmlFor="company-size">
              <span>Company size</span>
              <select id="company-size" value={companySize} onChange={(event) => setCompanySize(event.target.value as Enquiry["companySize"])}>
                <option value="1-50">1–50 employees</option>
                <option value="51-250">51–250 employees</option>
                <option value="251-1000">251–1,000 employees</option>
                <option value="1001-5000">1,001–5,000 employees</option>
                <option value="5000+">5,000+ employees</option>
              </select>
            </label>
            <label className="form-field" htmlFor="urgency">
              <span>Urgency</span>
              <select id="urgency" value={urgency} onChange={(event) => setUrgency(event.target.value as Enquiry["urgency"])}>
                <option value="low">Exploratory</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="critical">Time critical</option>
              </select>
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="intake-actions">
            <p>By submitting, you confirm this enquiry contains no sensitive personal data.</p>
            <button className="button button-primary button-large" disabled={isSubmitting} type="submit">
              {isSubmitting ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}
              {isSubmitting ? "Reviewing enquiry…" : "Submit enquiry"}
            </button>
          </div>
        </form>

        {decision && (
          <section className="submission-success" aria-live="polite">
            <div className="success-icon"><CheckCircle2 size={21} /></div>
            <div>
              <span className="eyebrow">Enquiry received · {decision.enquiry.id}</span>
              <h2>Thank you. The right team will review your request.</h2>
              <p>We’ve captured your enquiry and its supporting context. You do not need to take another action.</p>
              <div className="internal-trace">
                <span>Demo-only internal trace</span>
                <strong>{SERVICE_LINE_LABELS[decision.classification.primaryServiceLine]}</strong>
                <small>{decision.route.status === "needs_review" ? "Junior analyst review required" : `Prepared for ${decision.route.destination.lead}`}</small>
              </div>
            </div>
            <button
              className="button button-secondary"
              onClick={() => onOpenInternalView(decision.route.status === "needs_review" ? "analyst" : "lead")}
              type="button"
            >
              Follow the handoff <ArrowRight size={15} />
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
