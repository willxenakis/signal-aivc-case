import blindDataset from "../../evals/blind-set.json";
import { TriageWorkbench } from "@/components/triage-workbench";
import { buildSyntheticEvaluation } from "@/domain/synthetic-run";
import { parseExternalEvaluationDataset } from "@/eval/external-dataset";

const INTERVIEW_CASE_IDS = new Set([
  "BLIND-TXMAQB",
  "BLIND-YSCRH1",
  "BLIND-G5UHR5",
  "BLIND-Y8DKVE",
  "BLIND-APNC13",
  "BLIND-QNQU3W",
]);

export default async function HomePage() {
  const benchmark = await buildSyntheticEvaluation("balanced");
  const blind = parseExternalEvaluationDataset(blindDataset);
  const demoCases = blind.cases
    .filter((item) => INTERVIEW_CASE_IDS.has(item.id))
    .map((item) => ({ id: item.id, intake: item.intake }));

  return (
    <TriageWorkbench
      demoCases={demoCases}
      initialDecisions={benchmark.decisions}
    />
  );
}
