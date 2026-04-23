
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} folder - The folder to upload to.
 * @returns {Promise<Object>} - The Cloudinary upload result.
 */
export async function uploadToCloudinary(buffer, folder = 'imtihan/textbooks') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file.
 * @returns {Promise<Object>} - The Cloudinary deletion result.
 */
export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}