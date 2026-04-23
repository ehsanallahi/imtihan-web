'use server'

import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'

/**
 * Updates an MCQ record.
 */
export async function updateMcqAction(id, data) {
  try {
    const authResult = await authorize("mcq", "write")
    if (authResult.error) throw new Error(authResult.error)

    await db.mCQ.update({
      where: { id },
      data: {
        question: data.question,
        questionUrdu: data.questionUrdu,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        difficulty: data.difficulty,
        topicTag: data.topicTag,
      }
    })

    return { success: true }
  } catch (error) {
    console.error("[UPDATE_MCQ_ERROR]:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Toggles the approval status of an MCQ.
 */
export async function approveMcqAction(id, isApproved) {
  try {
    const authResult = await authorize("mcq", "write")
    if (authResult.error) throw new Error(authResult.error)

    await db.mCQ.update({
      where: { id },
      data: { isApproved }
    })

    return { success: true }
  } catch (error) {
    console.error("[APPROVE_MCQ_ERROR]:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Approves all MCQs for a specific upload.
 */
export async function bulkApproveMcqsAction(uploadId) {
  try {
    const authResult = await authorize("mcq", "write")
    if (authResult.error) throw new Error(authResult.error)

    await db.mCQ.updateMany({
      where: { textbookUploadId: uploadId },
      data: { isApproved: true }
    })

    revalidatePath(`/dashboard/content/${uploadId}`)
    return { success: true }
  } catch (error) {
    console.error("[BULK_APPROVE_MCQ_ERROR]:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Deletes a single MCQ.
 */
export async function deleteMcqAction(id) {
  try {
    const authResult = await authorize("mcq", "write")
    if (authResult.error) throw new Error(authResult.error)

    await db.mCQ.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error("[DELETE_MCQ_ERROR]:", error)
    return { success: false, error: error.message }
  }
}
