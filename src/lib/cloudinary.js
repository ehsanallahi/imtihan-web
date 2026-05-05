import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { Readable } from 'stream';

/**
 * Uploads a file buffer to Cloudinary using stream upload.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} folder - The folder to upload to.
 * @returns {Promise<Object>} - The Cloudinary upload result.
 */
export async function uploadToCloudinary(buffer, folder = 'imtihan/textbooks') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_chunked_stream(
      {
        folder,
        resource_type: 'auto',
        chunk_size: 6000000, // 6MB chunks (must be > 5MB and < 10MB)
        timeout: 120000, // 120 seconds timeout just in case
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convert buffer to Readable stream and pipe to Cloudinary
    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file.
 * @param {string} resourceType - The resource type of the file (image, raw, video).
 * @returns {Promise<Object>} - The Cloudinary deletion result.
 */
export async function deleteFromCloudinary(publicId, resourceType = 'raw') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}