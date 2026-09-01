import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createOpenAI } from "@ai-sdk/openai";
import { createGateway } from "ai";

import { AiEvidenceClassifier } from "../src/ai/ai-classifier";
import {
  LIVE_EVAL_HELP,
  parseLiveEvalArgs,
  type LiveEvalCliOptions,
} from "../src/eval/cli-options";
import {
  parseExternalEvaluationDataset,
  toLiveEvaluationDataset,
} from "../src/eval/external-dataset";
import {
  redactSensitiveText,
  runLiveEvaluationDataset,
  runSyntheticLiveEvaluation,
  selectEvaluationGoldLabels,
  selectSyntheticGoldLabels,
  type LiveEvaluationDataset,
  type LiveEvaluationProgress,
} from "../src/eval/live-evaluation";

function percent(value: number | null) {
  return value === null ? "N/A" : `${(value * 100).toFixed(1)}%`;
}

function createLiveClassifier(options: LiveEvalCliOptions) {
  if (!options.apiKey) {
    throw new Error("An API key is required for a live evaluation.");
  }

  if (options.provider === "openai") {
    const openai = createOpenAI({ apiKey: options.apiKey });
    return new AiEvidenceClassifier({
      model: openai(options.model),
      providerName: "openai-direct",
      modelName: options.model,
    });
  }

  const gateway = createGateway({ apiKey: options.apiKey });
  return new AiEvidenceClassifier({
    model: gateway(options.model),
    providerName: "vercel-ai-gateway",
    modelName: options.model,
  });
}

async function loadExternalDataset(options: LiveEvalCliOptions) {
  if (!options.datasetPath) return null;
  const raw = await readFile(resolve(options.datasetPath), "utf8");
  return toLiveEvaluationDataset(
    parseExternalEvaluationDataset(JSON.parse(raw) as unknown),
  );
}

function printDryRun(
  options: LiveEvalCliOptions,
  dataset: LiveEvaluationDataset | null,
) {
  const labels = dataset
    ? selectEvaluationGoldLabels(
        dataset.labels,
        options.split,
        options.caseIds,
        options.limit,
      )
    : selectSyntheticGoldLabels(
        options.split,
        options.caseIds,
        options.limit,
      );
  console.log("Signal live-model evaluation — dry run");
  console.log(
    `Dataset: ${dataset?.name ?? "Project-authored synthetic development portfolio"}`,
  );
  console.log(`Provider: ${options.provider}`);
  console.log(`Model: ${options.model}`);
  console.log(`Policy: ${options.reviewPolicy}`);
  console.log(`Cases: ${labels.length}`);
  if (dataset) {
    if (dataset.quality.warnings.length === 0) {
      console.log("Dataset limitations: none recorded");
    } else {
      for (const warning of dataset.quality.warnings) {
        console.log(`- dataset limitation: ${warning}`);
      }
    }
  } else {
    console.log(
      "Dataset purpose: built-in synthetic development fixtures",
    );
  }
  for (const label of labels) console.log(`- ${label.enquiryId}`);
  console.log("No API calls were made.");
}

function printSummary(report: Awaited<ReturnType<typeof runSyntheticLiveEvaluation>>) {
  const metrics = report.summary.successfulCaseMetrics;
  console.log("\nLive evaluation summary");
  console.log(`Attempted: ${report.summary.attempted}`);
  console.log(`Provider success: ${percent(report.summary.providerSuccessRate)}`);
  console.log(
    `End-to-end accuracy: ${percent(report.summary.endToEndClassificationAccuracy)}`,
  );
  console.log(
    `Accuracy among successful calls: ${percent(metrics.accuracy)}`,
  );
  console.log(`Macro F1: ${percent(metrics.macroF1)}`);
  console.log(
    `Complexity accuracy: ${percent(report.summary.complexityAccuracyAmongSuccesses)}`,
  );
  console.log(`Auto-route precision: ${percent(metrics.autoRoutePrecision)}`);
  console.log(`Automation coverage: ${percent(metrics.automationCoverage)}`);
  console.log(`Review capture: ${percent(metrics.reviewCaptureRate)}`);
  console.log(`Review precision: ${percent(metrics.reviewPrecision)}`);
  console.log(
    `Unnecessary review rate: ${percent(metrics.unnecessaryReviewRate)}`,
  );
  console.log(
    `Evidence validity: ${percent(report.summary.evidenceValidityAmongSuccesses)}`,
  );
  console.log(
    `Latency: ${report.summary.latency.averageMs.toFixed(0)} ms average / ${report.summary.latency.p95Ms} ms p95`,
  );
  console.log(
    `Tokens: ${report.summary.tokens.input} input / ${report.summary.tokens.output} output`,
  );
  if (report.datasetQuality.warnings.length === 0) {
    console.log("Dataset limitations: none recorded");
  } else {
    for (const warning of report.datasetQuality.warnings) {
      console.log(`Dataset limitation: ${warning}`);
    }
  }
}

async function main() {
  let secrets: string[] = [];
  try {
    const options = parseLiveEvalArgs(process.argv.slice(2));
    secrets = options.apiKey ? [options.apiKey] : [];

    if (options.help) {
      console.log(LIVE_EVAL_HELP);
      return;
    }
    const externalDataset = await loadExternalDataset(options);
    if (options.dryRun) {
      printDryRun(options, externalDataset);
      return;
    }

    console.log("Signal strict live-model evaluation");
    console.log(`Provider: ${options.provider}`);
    console.log(`Model: ${options.model}`);
    console.log(`Split: ${options.split}`);
    console.log(`Policy: ${options.reviewPolicy}`);
    console.log(
      `Dataset: ${externalDataset?.name ?? "Project-authored synthetic development portfolio"}`,
    );
    console.log("Fallback: disabled");

    const classifier = createLiveClassifier(options);
    const evaluationOptions = {
      classifier,
      provider: options.provider,
      model: options.model,
      split: options.split,
      reviewPolicy: options.reviewPolicy,
      limit: options.limit,
      caseIds: options.caseIds,
      redactSecrets: secrets,
      onProgress(progress: LiveEvaluationProgress) {
        const position = String(progress.index).padStart(2, "0");
        const total = String(progress.total).padStart(2, "0");
        console.log(
          `[${position}/${total}] ${progress.enquiryId} ${progress.status.toUpperCase()}`,
        );
      },
    } as const;
    const report = externalDataset
      ? await runLiveEvaluationDataset({
          ...evaluationOptions,
          dataset: externalDataset,
        })
      : await runSyntheticLiveEvaluation(evaluationOptions);

    const outputPath = resolve(options.outputPath);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });

    printSummary(report);
    console.log(`Report: ${outputPath}`);
    if (report.summary.failed > 0) {
      console.error(
        `${report.summary.failed} provider call(s) failed; exiting with status 1.`,
      );
      process.exitCode = 1;
    }
  } catch (error) {
    const message = redactSensitiveText(
      error instanceof Error ? error.message : String(error),
      secrets,
    );
    console.error(`Evaluation failed: ${message}`);
    process.exitCode = 1;
  }
}

await main();
