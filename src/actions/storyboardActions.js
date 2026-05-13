'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { flashModel } from "@/lib/services/ai-service";
import { checkAndDeductCredits } from "./creditActions";

export async function generateChapterStoryboard(chapterId) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Check and deduct credits
    const creditCheck = await checkAndDeductCredits(5);
    if (!creditCheck.allowed) {
      return { success: false, error: creditCheck.error };
    }

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    });

    if (!chapter) return { success: false, error: "Chapter not found" };

    // Use MCQ content or Textbook content as source if available
    const mcqs = await db.mCQ.findMany({
      where: { chapterId },
      take: 20
    });

    const context = mcqs.map(m => m.question + " " + (m.explanation || "")).join("\n");

    const prompt = `
      Create a 5-slide educational storyboard summary for the chapter "${chapter.name}" in the subject "${chapter.subject.name}".
      
      CONTEXT:
      ${context.substring(0, 5000)}
      
      For each slide, provide:
      1. title: A catchy slide title.
      2. points: 3 key bullet points.
      3. narration: A 2-sentence script for a voice narrator to explain this slide.
      4. visualDescription: A description of what image should be shown on this slide.
      
      Return ONLY a strict JSON array of 5 slide objects.
    `;

    const result = await flashModel.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const slides = JSON.parse(jsonString);

    return { success: true, slides };
  } catch (error) {
    console.error("GENERATE_STORYBOARD_ERROR:", error);
    return { success: false, error: "Failed to generate storyboard." };
  }
}
