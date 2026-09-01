import type { ServiceLine } from "@/domain/schemas";

export type BlindEvaluationCase = {
  enquiryId: string;
  expectedServiceLine: ServiceLine;
  predictedServiceLine: ServiceLine;
  correct: boolean;
  expectedComplexity: "simple" | "moderate" | "complex";
  predictedComplexity: "simple" | "moderate" | "complex";
  complexityCorrect: boolean;
  expectedReview: boolean;
  predictedReview: boolean;
  evidenceValidationErrors: string[];
};

export const blindEvaluationRun = {
  "generatedAt": "2026-09-01T01:39:46.012Z",
  "config": {
    "datasetName": "AIVC Intake Triage Blind Set v1",
    "provider": "openai",
    "model": "gpt-5.6-terra",
    "split": "holdout",
    "reviewPolicy": "balanced",
    "limit": null,
    "caseIds": [],
    "fallbackEnabled": false
  },
  "summary": {
    "attempted": 60,
    "succeeded": 60,
    "failed": 0,
    "providerSuccessRate": 1,
    "endToEndClassificationAccuracy": 1,
    "endToEndComplexityAccuracy": 0.7666666666666667,
    "complexityAccuracyAmongSuccesses": 0.7666666666666667,
    "successfulCaseMetrics": {
      "total": 60,
      "accuracy": 1,
      "macroF1": 1,
      "perServiceLine": {
        "ai_strategy_value": {
          "support": 11,
          "precision": 1,
          "recall": 1,
          "f1": 1
        },
        "data_ai_platforms": {
          "support": 9,
          "precision": 1,
          "recall": 1,
          "f1": 1
        },
        "ai_applications_automation": {
          "support": 10,
          "precision": 1,
          "recall": 1,
          "f1": 1
        },
        "decision_intelligence_operations": {
          "support": 10,
          "precision": 1,
          "recall": 1,
          "f1": 1
        },
        "ai_governance_risk_security": {
          "support": 11,
          "precision": 1,
          "recall": 1,
          "f1": 1
        },
        "adoption_operating_model": {
          "support": 9,
          "precision": 1,
          "recall": 1,
          "f1": 1
        }
      },
      "automationCoverage": 0.8333333333333334,
      "autoRoutePrecision": 1,
      "reviewCaptureRate": 0.8333333333333334,
      "reviewPrecision": 0.5,
      "unnecessaryReviewRate": 0.09259259259259259,
      "correct": 60,
      "autoRouted": 50
    },
    "policyComparison": {
      "conservative": {
        "total": 60,
        "accuracy": 1,
        "macroF1": 1,
        "perServiceLine": {
          "ai_strategy_value": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "data_ai_platforms": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_applications_automation": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "decision_intelligence_operations": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_governance_risk_security": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "adoption_operating_model": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          }
        },
        "automationCoverage": 0,
        "autoRoutePrecision": null,
        "reviewCaptureRate": 1,
        "reviewPrecision": 0.1,
        "unnecessaryReviewRate": 1,
        "correct": 60,
        "autoRouted": 0
      },
      "balanced": {
        "total": 60,
        "accuracy": 1,
        "macroF1": 1,
        "perServiceLine": {
          "ai_strategy_value": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "data_ai_platforms": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_applications_automation": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "decision_intelligence_operations": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_governance_risk_security": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "adoption_operating_model": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          }
        },
        "automationCoverage": 0.8333333333333334,
        "autoRoutePrecision": 1,
        "reviewCaptureRate": 0.8333333333333334,
        "reviewPrecision": 0.5,
        "unnecessaryReviewRate": 0.09259259259259259,
        "correct": 60,
        "autoRouted": 50
      },
      "aggressive": {
        "total": 60,
        "accuracy": 1,
        "macroF1": 1,
        "perServiceLine": {
          "ai_strategy_value": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "data_ai_platforms": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_applications_automation": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "decision_intelligence_operations": {
            "support": 10,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "ai_governance_risk_security": {
            "support": 11,
            "precision": 1,
            "recall": 1,
            "f1": 1
          },
          "adoption_operating_model": {
            "support": 9,
            "precision": 1,
            "recall": 1,
            "f1": 1
          }
        },
        "automationCoverage": 0.8333333333333334,
        "autoRoutePrecision": 1,
        "reviewCaptureRate": 0.8333333333333334,
        "reviewPrecision": 0.5,
        "unnecessaryReviewRate": 0.09259259259259259,
        "correct": 60,
        "autoRouted": 50
      }
    },
    "evidenceValidityAmongSuccesses": 0.95,
    "endToEndEvidenceValidity": 0.95,
    "latency": {
      "averageMs": 9040.433333333332,
      "p95Ms": 12759
    },
    "tokens": {
      "input": 71433,
      "output": 45605,
      "total": 117038
    }
  },
  "datasetQuality": {
    "purpose": "blind_evaluation",
    "independentLabels": true,
    "frozenAt": "2026-09-01T01:26:59Z",
    "ordinalLabelPredictability": 0,
    "warnings": []
  },
  "cases": [
    {
      "enquiryId": "BLIND-YSCRH1",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": true,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-L7HOAF",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-TXMAQB",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-3LSS0R",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-QNQU3W",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": true,
      "evidenceValidationErrors": [
        "Research evidence 'E3' references an unknown company source."
      ]
    },
    {
      "enquiryId": "BLIND-XJ7E6R",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-G5UHR5",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": true,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-2CAD86",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-T6GXUB",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-7QDC75",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": true,
      "evidenceValidationErrors": [
        "Research evidence 'E6' references an unknown company source."
      ]
    },
    {
      "enquiryId": "BLIND-37UF4N",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-QK5KOU",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-Z6ZKXV",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-4SE78P",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-35YE6A",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-GG2P1G",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-8LW1ZK",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": true,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-GJ8DOS",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-2FELOB",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-6SJZD9",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-FJGJHI",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-7DHME8",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-MLZG7O",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "simple",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-8ZBD7Y",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-V2LU5L",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-S4DXP2",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-IFYFYU",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-HTZESN",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": true,
      "evidenceValidationErrors": [
        "Research evidence 'E3' references an unknown company source."
      ]
    },
    {
      "enquiryId": "BLIND-ELUBWR",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-DB427U",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-7EZ7MF",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-AJVG6V",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-GVF9D3",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-D56O8O",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-CJ1P4C",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-7TYZOZ",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-031RHX",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-Y8DKVE",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": true,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-05GB9K",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-PK14YZ",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-64WGFB",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-36BBUK",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-HRJRLU",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-APNC13",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-PMYCG5",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": true,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-7BSZ5F",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-V19QTU",
      "expectedServiceLine": "ai_applications_automation",
      "predictedServiceLine": "ai_applications_automation",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-JJ0SF0",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-OYRPN4",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-856HR8",
      "expectedServiceLine": "decision_intelligence_operations",
      "predictedServiceLine": "decision_intelligence_operations",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-6YH0SN",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-VPZ21V",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-A2XAIZ",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-RK1EAY",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "moderate",
      "predictedComplexity": "moderate",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-T8UZXE",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-4VPW7I",
      "expectedServiceLine": "ai_strategy_value",
      "predictedServiceLine": "ai_strategy_value",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-YRDY2U",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": true,
      "predictedReview": true,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-P1SX81",
      "expectedServiceLine": "data_ai_platforms",
      "predictedServiceLine": "data_ai_platforms",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "moderate",
      "complexityCorrect": false,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-O3FWI5",
      "expectedServiceLine": "adoption_operating_model",
      "predictedServiceLine": "adoption_operating_model",
      "correct": true,
      "expectedComplexity": "simple",
      "predictedComplexity": "simple",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    },
    {
      "enquiryId": "BLIND-EIKB29",
      "expectedServiceLine": "ai_governance_risk_security",
      "predictedServiceLine": "ai_governance_risk_security",
      "correct": true,
      "expectedComplexity": "complex",
      "predictedComplexity": "complex",
      "complexityCorrect": true,
      "expectedReview": false,
      "predictedReview": false,
      "evidenceValidationErrors": []
    }
  ]
} as const;
