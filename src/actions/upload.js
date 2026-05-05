'use server'

import cloudinary from '@/lib/cloudinary'
import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-guards'

/**
 * Server Action to upload and save a Past Paper.
 * Restricted to Content Editors and Super Admins.
 */
export async function uploadPastPaper(formData) {
  // 1. Authorize
  const authResult = await authorize("past_paper", "write")
  if (authResult.error) {
    throw new Error(authResult.error)
  }
  const user = authResult.user

  // 2. Extract Data
  const file = formData.get('file')
  const title = formData.get('title')
  const year = parseInt(formData.get('year'))
  const board = formData.get('board')
  const grade = formData.get('grade')
  const subjectId = formData.get('subjectId')

  if (!file || !title || !year || !board || !grade || !subjectId) {
    throw new Error('Missing required fields for Past Paper upload')
  }

  // 3. Process File for Cloudinary
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  // 4. Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: 'raw',
    folder: `imtihan/past-papers/${board}/${grade}`,
    use_filename: true,
    unique_filename: true,
  })

  // 5. Persist to Database
  const pastPaper = await db.pastPaper.create({
    data: {
      title,
      year,
      board,
      grade,
      subjectId,
      cloudinaryUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedById: user.id
    }
  })

  return { success: true, url: result.secure_url, id: pastPaper.id }
}
