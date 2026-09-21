import { buildAgentInstructions } from "@/lib/pedagogy/instructions";
import type { SessionPlan } from "@/lib/pedagogy/types";
import { REALTIME_TOOLS } from "@/lib/voice/tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Missing OPENAI_API_KEY. Add it to .env.local." },
      { status: 500 },
    );
  }

  let plan: SessionPlan;
  let performed = false;
  try {
    const body = (await request.json()) as { plan?: SessionPlan; performed?: boolean };
    if (!body.plan) {
      return Response.json({ error: "plan is required" }, { status: 400 });
    }
    plan = body.plan;
    performed = Boolean(body.performed);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const instructions = buildAgentInstructions(plan, performed);

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expires_after: { anchor: "created_at", seconds: 600 },
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions,
        tools: performed ? [] : REALTIME_TOOLS,
        tool_choice: performed ? "none" : "auto",
        output_modalities: ["audio"],
        audio: {
          input: {
            transcription: { model: "gpt-4o-mini-transcribe" },
            turn_detection: {
              type: "semantic_vad",
              eagerness: "low",
              create_response: !performed,
              interrupt_response: false,
            },
          },
          output: {
            voice: "ash",
            speed: 0.95,
          },
        },
      },
    }),
  });

  const payload = (await response.json()) as {
    value?: string;
    client_secret?: { value?: string };
    error?: { message?: string };
  };

  const value = payload.value ?? payload.client_secret?.value;

  if (!response.ok || !value) {
    return Response.json(
      { error: payload.error?.message ?? "Could not create a realtime session" },
      { status: response.status || 500 },
    );
  }

  return Response.json({ value });
}
