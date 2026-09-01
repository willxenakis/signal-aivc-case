"use client";

import { LoaderCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type {
  CompanyDossier,
  DecisionPackage,
  Enquiry,
  ReviewPolicy,
} from "@/domain/schemas";

type NewIntakeDialogProps = {
  companies: CompanyDossier[];
  reviewPolicy: ReviewPolicy;
  onClose: () => void;
  onCreated: (decision: DecisionPackage) => void;
};

export function NewIntakeDialog({
  companies,
  reviewPolicy,
  onClose,
  onCreated,
}: NewIntakeDialogProps) {
  const [companyId, setCompanyId] = useState(companies[0].id);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Enquiry["urgency"]>("standard");
  const [mode, setMode] = useState<"baseline" | "ai">("baseline");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = companies.find((item) => item.id === companyId);
    if (!company) return;

    setIsSubmitting(true);
    setError(null);
    const enquiry: Enquiry = {
      id: `MANUAL-${Date.now()}`,
      contactName: "Live demo contact",
      senderEmail: `demo@${company.domain}`,
      companyName: company.name,
      description,
      selfReportedIndustry: company.industry,
      companySize: company.employeeBand,
      urgency,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry, reviewPolicy, mode }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result === "object" && result && "message" in result
            ? String(result.message)
            : "The enquiry could not be triaged.",
        );
      }
      onCreated(result as DecisionPackage);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The enquiry could not be triaged.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="new-intake-title"
        aria-modal="true"
        className="dialog-card"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog-header">
          <div>
            <div className="eyebrow">Live scenario</div>
            <h2 id="new-intake-title">Add an enquiry</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Close dialog</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="company">Synthetic company</label>
          <select id="company" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <label htmlFor="description">What does the client need?</label>
          <textarea
            id="description"
            minLength={20}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the business problem, desired outcome, and known constraints…"
            required
            rows={6}
            value={description}
          />

          <div className="form-row">
            <div>
              <label htmlFor="urgency">Urgency</label>
              <select id="urgency" value={urgency} onChange={(event) => setUrgency(event.target.value as Enquiry["urgency"])}>
                <option value="low">Low</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="mode">Classifier</label>
              <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as "baseline" | "ai")}>
                <option value="baseline">Local evidence baseline</option>
                <option value="ai">Live AI + safe fallback</option>
              </select>
            </div>
          </div>

          {mode === "ai" && (
            <p className="mode-note">
              <Sparkles size={14} /> Uses AI Gateway when authenticated. Provider errors produce a flagged local fallback.
            </p>
          )}
          {error && <p className="form-error">{error}</p>}

          <div className="dialog-actions">
            <button className="button button-ghost" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}
              {isSubmitting ? "Building evidence…" : "Run triage"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
