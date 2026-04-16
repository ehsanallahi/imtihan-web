'use server'

import cloudinary from '@/lib/cloudinary'
// import { db } from '@/lib/db' // Uncomment this once Prisma is set up

export async function uploadPastPaper(formData) {
  const file = formData.get('file')
  const board = formData.get('board')

  if (!file) {
    throw new Error('No file provided')
  }

  // Convert File to base64
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: 'raw',          // 'raw' for PDFs
    folder: `imtihan/past-papers/${board || 'misc'}`,
    use_filename: true,
    unique_filename: true,
  })

  // Save URL to database via Prisma (placeholder)
  /*
  await db.pastPaper.create({
    data: {
      cloudinaryUrl: result.secure_url,
      cloudinaryId:  result.public_id,
      // ... other fields
    }
  })
  */

  return { url: result.secure_url }
}
