import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { getGroqTutorResponse } from "@/lib/services/ai-service";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // 1. Fetch Session and Attempts
    const session = await db.examSession.findUnique({
      where: { id: sessionId },
      include: {
        attempts: {
          include: {
            mcq: true
          }
        }
      }
    });

    if (!session || session.studentId !== payload.id) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // 2. Prepare context for AI
    const correctCount = session.attempts.filter(a => a.isCorrect).length;
    const totalCount = session.attempts.length;
    const accuracy = ((correctCount / totalCount) * 100).toFixed(1);

    const incorrectDetails = session.attempts
      .filter(a => !a.isCorrect)
      .map(a => `- Question: ${a.mcq.question}\n  Correct Answer: ${a.mcq.correctAnswer}\n  Student Choice: ${a.selectedAnswer}`)
      .join('\n\n');

    const systemPrompt = `You are "Imtihan AI Tutor", an expert academic assistant for Pakistani board exams (9th-12th grade). 
Analyze the student's performance in this quiz and provide a constructive, encouraging summary.
Highlight:
1. Overall performance level.
2. Specific topics they struggled with (based on the questions they got wrong).
3. Practical advice on what to study next on the Imtihan app.
4. Encourage them to keep practicing other chapters on Imtihan.
5. Keep it concise but personal (max 200 words).
Use formatting (bullet points, bold text) to make it readable.
Respond in ${session.student?.profile?.medium || 'English'}.`;

    const userPrompt = `Quiz Results:
- Total Questions: ${totalCount}
- Correct Answers: ${correctCount}
- Accuracy: ${accuracy}%

Incorrect Questions Details:
${incorrectDetails || 'None! The student got everything correct.'}

Please analyze this and provide guidance.`;

    // 3. Call AI Service (Using the general tutor response logic)
    const analysis = await getGroqTutorResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 'english'); // Language is handled by the system prompt

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error("[AI_ANALYZE_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to analyze results. Please try again later." },
      { status: 500 }
    );
  }
}
