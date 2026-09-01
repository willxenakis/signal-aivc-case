import { z } from "zod";

import { createClassifier } from "@/ai/classifier-factory";
import { triageEnquiry } from "@/domain/pipeline";
import { IntakeOnlyResearchProvider } from "@/domain/research";
import { enquirySchema } from "@/domain/schemas";

const requestSchema = z.object({
  enquiry: enquirySchema,
  reviewPolicy: z
    .enum(["conservative", "balanced", "aggressive"])
    .default("balanced"),
  mode: z.enum(["baseline", "ai"]).optional(),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "invalid_request",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const hasLiveModel = Boolean(
      process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
    );
    const decision = await triageEnquiry({
      enquiry: parsed.data.enquiry,
      researchProvider: new IntakeOnlyResearchProvider(),
      classifier: createClassifier(
        parsed.data.mode ?? (hasLiveModel ? "ai" : "baseline"),
      ),
      reviewPolicy: parsed.data.reviewPolicy,
    });
    return Response.json(decision, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: "triage_failed",
        message: error instanceof Error ? error.message : "Unknown failure",
      },
      { status: 500 },
    );
  }
}
