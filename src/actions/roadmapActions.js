'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getChapterMastery } from "./analyticsActions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getStudyRoadmap() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // 1. Get mastery data (reusing the action we just created)
    const masteryResult = await getChapterMastery();
    if (!masteryResult.success) return masteryResult;

    const subjects = masteryResult.data;

    // 2. Identify priority chapters (Mastery < 60%)
    const weakChapters = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        if (chapter.mastery < 60) {
          weakChapters.push({
            subjectName: subject.name,
            subjectId: subject.id,
            chapterName: chapter.name,
            chapterNumber: chapter.number,
            chapterId: chapter.id,
            mastery: chapter.mastery
          });
        }
      });
    });

    // Sort by mastery (weakest first)
    weakChapters.sort((a, b) => a.mastery - b.mastery);

    // 3. Use AI to generate a friendly study summary/plan
    const topWeak = weakChapters.slice(0, 3);
    let aiSummary = "Great job on your progress! Keep practicing to master all your subjects.";

    if (topWeak.length > 0) {
      const context = topWeak.map(c => `- ${c.subjectName}: Chapter ${c.chapterNumber} (${c.chapterName}) - Mastery: ${c.mastery}%`).join("\n");
      
      const prompt = `
        You are "Imtihan AI Study Advisor". A student has the following weak areas in their studies:
        ${context}
        
        Write a very short (max 2 sentences), encouraging study advice for this student. 
        Focus on these specific chapters. Be friendly and motivating.
      `;

      try {
        const result = await flashModel.generateContent(prompt);
        aiSummary = result.response.text().trim();
      } catch (aiErr) {
        console.error("AI_ADVISOR_ERROR:", aiErr);
      }
    }

    return { 
      success: true, 
      recommendations: weakChapters.slice(0, 5), // Suggest top 5 weak areas
      aiSummary 
    };

  } catch (error) {
    console.error("GET_STUDY_ROADMAP_ERROR:", error);
    return { success: false, error: "Failed to generate roadmap" };
  }
}
