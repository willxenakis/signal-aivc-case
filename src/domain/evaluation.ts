import { SERVICE_LINES, type ServiceLine } from "@/domain/schemas";

export type ServiceLineMetrics = {
  support: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
};

export type EvaluationRow = {
  expectedServiceLine: ServiceLine;
  predictedServiceLine: ServiceLine;
  expectedReview: boolean;
  predictedReview: boolean;
};

export type EvaluationMetrics = {
  total: number;
  accuracy: number;
  macroF1: number;
  perServiceLine: Record<ServiceLine, ServiceLineMetrics>;
  automationCoverage: number;
  autoRoutePrecision: number | null;
  reviewCaptureRate: number;
  reviewPrecision: number | null;
  unnecessaryReviewRate: number;
  correct: number;
  autoRouted: number;
};

function ratio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function precision(numerator: number, denominator: number) {
  return denominator === 0 ? null : numerator / denominator;
}

export function evaluatePredictions(
  rows: EvaluationRow[],
): EvaluationMetrics {
  const correct = rows.filter(
    (row) => row.expectedServiceLine === row.predictedServiceLine,
  ).length;
  const autoRoutedRows = rows.filter((row) => !row.predictedReview);
  const correctAutoRoutes = autoRoutedRows.filter(
    (row) => row.expectedServiceLine === row.predictedServiceLine,
  ).length;
  const expectedReviewRows = rows.filter((row) => row.expectedReview);
  const capturedReviews = expectedReviewRows.filter(
    (row) => row.predictedReview,
  ).length;
  const reviewedRows = rows.filter((row) => row.predictedReview);
  const correctlyReviewed = reviewedRows.filter(
    (row) => row.expectedReview,
  ).length;
  const expectedAutoRouteRows = rows.filter((row) => !row.expectedReview);
  const unnecessaryReviews = expectedAutoRouteRows.filter(
    (row) => row.predictedReview,
  ).length;
  const perServiceLine = Object.fromEntries(
    SERVICE_LINES.map((serviceLine) => {
      const support = rows.filter(
        (row) => row.expectedServiceLine === serviceLine,
      ).length;
      const predicted = rows.filter(
        (row) => row.predictedServiceLine === serviceLine,
      ).length;
      const truePositive = rows.filter(
        (row) =>
          row.expectedServiceLine === serviceLine &&
          row.predictedServiceLine === serviceLine,
      ).length;
      const servicePrecision = precision(truePositive, predicted);
      const serviceRecall = precision(truePositive, support);
      const f1 =
        support === 0
          ? null
          : servicePrecision === null ||
              serviceRecall === null ||
              servicePrecision + serviceRecall === 0
            ? 0
            : (2 * servicePrecision * serviceRecall) /
              (servicePrecision + serviceRecall);
      return [
        serviceLine,
        {
          support,
          precision: servicePrecision,
          recall: serviceRecall,
          f1,
        },
      ];
    }),
  ) as Record<ServiceLine, ServiceLineMetrics>;
  const supportedF1 = Object.values(perServiceLine).flatMap((metrics) =>
    metrics.f1 === null ? [] : [metrics.f1],
  );

  return {
    total: rows.length,
    accuracy: ratio(correct, rows.length),
    macroF1: ratio(
      supportedF1.reduce((total, value) => total + value, 0),
      supportedF1.length,
    ),
    perServiceLine,
    automationCoverage: ratio(autoRoutedRows.length, rows.length),
    autoRoutePrecision: precision(correctAutoRoutes, autoRoutedRows.length),
    reviewCaptureRate: ratio(capturedReviews, expectedReviewRows.length),
    reviewPrecision: precision(correctlyReviewed, reviewedRows.length),
    unnecessaryReviewRate: ratio(
      unnecessaryReviews,
      expectedAutoRouteRows.length,
    ),
    correct,
    autoRouted: autoRoutedRows.length,
  };
}
