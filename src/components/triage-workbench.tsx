"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  HardDrive,
  SlidersHorizontal,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { AnalystWorkspace } from "@/components/analyst-workspace";
import { ClientIntakeView, type DemoIntakeCase } from "@/components/client-intake-view";
import { TeamLeadInbox, type Complexity } from "@/components/team-lead-inbox";
import { applyRoutingPolicy } from "@/domain/routing";
import type {
  DecisionPackage,
  ReviewPolicy,
  ServiceLine,
} from "@/domain/schemas";

type ActiveView = "intake" | "analyst" | "lead" | "evaluation";

type WorkflowRecord = {
  analyst?: {
    serviceLine: ServiceLine;
    note: string;
    resolvedAt: string;
  };
  lead?: {
    status: "accepted" | "returned";
    complexity: Complexity;
    note: string;
    resolvedAt: string;
  };
};

type TriageWorkbenchProps = {
  initialDecisions: DecisionPackage[];
  demoCases: DemoIntakeCase[];
};

const WORKFLOW_STORAGE_KEY = "signal-workflow:v2";

const EvaluationView = dynamic(
  () => import("@/components/evaluation-view").then((module) => module.EvaluationView),
  { loading: () => <div className="view-loading">Loading recorded blind run…</div> },
);

function parseStoredWorkflow(value: string): Record<string, WorkflowRecord> {
  const parsed: unknown = JSON.parse(value);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== 2 ||
    !("records" in parsed) ||
    !parsed.records ||
    typeof parsed.records !== "object"
  ) {
    throw new Error("Unsupported workflow data");
  }
  return parsed.records as Record<string, WorkflowRecord>;
}

export function TriageWorkbench({
  initialDecisions,
  demoCases,
}: TriageWorkbenchProps) {
  const [activeView, setActiveView] = useState<ActiveView>("intake");
  const [policy, setPolicy] = useState<ReviewPolicy>("balanced");
  const [decisions, setDecisions] = useState(initialDecisions);
  const [workflow, setWorkflow] = useState<Record<string, WorkflowRecord>>({});
  const [workflowLoaded, setWorkflowLoaded] = useState(false);
  const [analystSelectedId, setAnalystSelectedId] = useState("");
  const [leadSelectedId, setLeadSelectedId] = useState(initialDecisions[0]?.id ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(WORKFLOW_STORAGE_KEY);
      if (saved) {
        try {
          setWorkflow(parseStoredWorkflow(saved));
        } catch {
          window.localStorage.removeItem(WORKFLOW_STORAGE_KEY);
        }
      }
      setWorkflowLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!workflowLoaded) return;
    window.localStorage.setItem(
      WORKFLOW_STORAGE_KEY,
      JSON.stringify({ version: 2, records: workflow }),
    );
  }, [workflow, workflowLoaded]);

  const routedDecisions = useMemo(() => decisions.map((decision) => {
    const correction = workflow[decision.id]?.analyst?.serviceLine;
    const corrected: DecisionPackage = correction
      ? {
          ...decision,
          classification: {
            ...decision.classification,
            primaryServiceLine: correction,
            secondaryServiceLine:
              decision.classification.secondaryServiceLine === correction
                ? null
                : decision.classification.secondaryServiceLine,
          },
        }
      : decision;
    return { ...corrected, route: applyRoutingPolicy(corrected, policy) };
  }), [decisions, policy, workflow]);

  const analystQueue = routedDecisions.filter((decision) => {
    const record = workflow[decision.id];
    return record?.lead?.status === "returned" ||
      (decision.route.status === "needs_review" && !record?.analyst);
  });
  const leadInbox = routedDecisions.filter((decision) => {
    const record = workflow[decision.id];
    if (record?.lead?.status === "returned") return false;
    return decision.route.status === "auto_routed" || Boolean(record?.analyst);
  });
  const analystReviewedIds = Object.entries(workflow)
    .filter(([, record]) => Boolean(record.analyst))
    .map(([id]) => id);
  const acceptedIds = Object.entries(workflow)
    .filter(([, record]) => record.lead?.status === "accepted")
    .map(([id]) => id);
  const adjustedComplexity = Object.fromEntries(
    Object.entries(workflow)
      .filter(([, record]) => record.lead?.status === "accepted")
      .map(([id, record]) => [id, record.lead!.complexity]),
  ) as Record<string, Complexity>;

  function handleCreated(decision: DecisionPackage) {
    setDecisions((current) => [decision, ...current.filter((item) => item.id !== decision.id)]);
    if (decision.route.status === "needs_review") setAnalystSelectedId(decision.id);
    else setLeadSelectedId(decision.id);
  }

  function openInternalView(view: "analyst" | "lead") {
    setActiveView(view);
  }

  function resolveAnalystCase(
    decision: DecisionPackage,
    serviceLine: ServiceLine,
    note: string,
  ) {
    setWorkflow((current) => ({
      ...current,
      [decision.id]: {
        ...current[decision.id],
        analyst: { serviceLine, note, resolvedAt: new Date().toISOString() },
        lead: undefined,
      },
    }));
    setLeadSelectedId(decision.id);
    setActiveView("lead");
  }

  function acceptLeadCase(
    decision: DecisionPackage,
    complexity: Complexity,
    note: string,
  ) {
    setWorkflow((current) => ({
      ...current,
      [decision.id]: {
        ...current[decision.id],
        lead: {
          status: "accepted",
          complexity,
          note,
          resolvedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function returnLeadCase(decision: DecisionPackage, note: string) {
    setWorkflow((current) => ({
      ...current,
      [decision.id]: {
        ...current[decision.id],
        lead: {
          status: "returned",
          complexity:
            current[decision.id]?.lead?.complexity ?? decision.classification.complexity,
          note,
          resolvedAt: new Date().toISOString(),
        },
      },
    }));
    setAnalystSelectedId(decision.id);
    setActiveView("analyst");
  }

  function clearSavedWorkflow() {
    setWorkflow({});
    window.localStorage.removeItem(WORKFLOW_STORAGE_KEY);
  }

  const navigation = [
    { id: "intake" as const, label: "Client intake", icon: ExternalLink },
    { id: "analyst" as const, label: "Analyst queue", icon: ClipboardList, count: analystQueue.length },
    { id: "lead" as const, label: "Team-lead inbox", icon: BriefcaseBusiness, count: leadInbox.length },
    { id: "evaluation" as const, label: "Blind evaluation", icon: BarChart3 },
  ];

  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">S</span>
          <div><strong>Signal</strong><span>Enquiry routing</span></div>
        </div>

        <span className="nav-label">Demo perspective</span>
        <nav aria-label="Product perspectives">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                aria-label={item.label}
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={item.label}
              >
                <Icon size={17} /><span>{item.label}</span>{"count" in item && <b>{item.count}</b>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="policy-card">
          <div><SlidersHorizontal size={14} /><span>Routing policy</span></div>
          <select value={policy} onChange={(event) => setPolicy(event.target.value as ReviewPolicy)}>
            <option value="balanced">Balanced</option>
            <option value="conservative">Conservative</option>
            <option value="aggressive">Aggressive</option>
          </select>
          <small>{policy === "balanced" ? "Review ambiguity and integrity failures." : policy === "conservative" ? "Review broader scope and incomplete context." : "Maximize direct routing coverage."}</small>
        </div>
        <div className="sidebar-identity"><span className="avatar"><Building2 size={14} /></span><div><strong>Case-study demo</strong><span>No authentication in prototype</span></div></div>
      </aside>

      <section className="product-main">
        <div className="prototype-banner">
          <span><CircleAlert size={14} /> Synthetic demonstration data only</span>
          <span className="storage-disclosure">
            <HardDrive size={13} /> Browser-local workflow state · no database
            <button onClick={clearSavedWorkflow} type="button">Clear saved actions</button>
          </span>
        </div>
        {activeView === "intake" && (
          <ClientIntakeView
            demoCases={demoCases}
            onCreated={handleCreated}
            onOpenInternalView={openInternalView}
            reviewPolicy={policy}
          />
        )}
        {activeView === "analyst" && (
          <AnalystWorkspace
            decisions={analystQueue}
            onOpenLeadInbox={() => setActiveView("lead")}
            onResolve={resolveAnalystCase}
            onSelect={setAnalystSelectedId}
            reviewPolicy={policy}
            selectedId={analystSelectedId}
          />
        )}
        {activeView === "lead" && (
          <TeamLeadInbox
            acceptedIds={acceptedIds}
            adjustedComplexity={adjustedComplexity}
            analystReviewedIds={analystReviewedIds}
            decisions={leadInbox}
            onAccept={acceptLeadCase}
            onReturn={returnLeadCase}
            onSelect={setLeadSelectedId}
            selectedId={leadSelectedId}
          />
        )}
        {activeView === "evaluation" && <EvaluationView />}
      </section>
    </div>
  );
}
