'use server'

import { analyzeImageProblem } from "@/lib/services/ai-service";
import { auth } from "@/auth";
import { checkAndDeductCredits } from "./creditActions";

export async function solveVisualProblem(base64Image, mimeType, prompt) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Basic validation
    if (!base64Image) return { success: false, error: "No image provided" };

    // Check and deduct credits (Visual solving is more expensive)
    const creditCheck = await checkAndDeductCredits(2);
    if (!creditCheck.allowed) {
      return { success: false, error: creditCheck.error };
    }

    const explanation = await analyzeImageProblem(base64Image, mimeType, prompt);

    return { success: true, explanation };
  } catch (error) {
    console.error("SOLVE_VISUAL_PROBLEM_ERROR:", error);
    return { success: false, error: error.message || "Failed to solve the visual problem." };
  }
}
