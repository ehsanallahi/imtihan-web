'use server'

import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-guards'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to delete a textbook upload and its associated data.
 * 
 * @param {string} textbookUploadId - The ID of the TextbookUpload record to delete.
 */
export async function deleteTextbookAction(textbookUploadId) {
  try {
    // 1. Authorize
    const authResult = await authorize("textbook_upload", "write")
    if (authResult.error) {
      throw new Error(authResult.error)
    }

    // 2. Fetch Upload Record
    const upload = await db.textbookUpload.findUnique({
      where: { id: textbookUploadId }
    })

    if (!upload) {
      throw new Error("Textbook upload record not found")
    }

    // 3. Delete from Cloudinary
    if (upload.cloudinaryId) {
      // Determine resource type from the URL
      const resourceType = upload.cloudinaryUrl.includes('/raw/') ? 'raw' : 'image'
      await deleteFromCloudinary(upload.cloudinaryId, resourceType)
    }

    // 4. Delete from Database (Cascade will handle MCQs if set up, or we delete them manually)
    // Assuming Prisma schema has cascade delete for MCQs linked to TextbookUpload
    await db.textbookUpload.delete({
      where: { id: textbookUploadId }
    })

    // 5. Revalidate Path
    revalidatePath('/dashboard/content')

    return { 
      success: true, 
      message: `Successfully deleted ${upload.originalName}`
    }

  } catch (error) {
    console.error("[DELETE_TEXTBOOK_ERROR]:", error)
    return { 
      success: false, 
      error: error.message || "Failed to delete textbook" 
    }
  }
}
