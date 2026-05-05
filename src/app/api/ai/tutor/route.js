import { NextResponse } from "next/server";
import { getGroqTutorResponse } from "@/lib/services/ai-service";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const aiResponse = await getGroqTutorResponse(messages);

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error("[AI_TUTOR_ROUTE_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI chat" },
      { status: 500 }
    );
  }
}
