'use server'

import { analyzeImageProblem } from "@/lib/services/ai-service";
import { auth } from "@/auth";

export async function solveVisualProblem(base64Image, mimeType, prompt) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Basic validation
    if (!base64Image) return { success: false, error: "No image provided" };

    const explanation = await analyzeImageProblem(base64Image, mimeType, prompt);

    return { success: true, explanation };
  } catch (error) {
    console.error("SOLVE_VISUAL_PROBLEM_ERROR:", error);
    return { success: false, error: error.message || "Failed to solve the visual problem." };
  }
}
