'use client'
import { CldUploadWidget } from 'next-cloudinary'

export function TextbookUploader({ onUpload }) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign"
      uploadPreset="imtihan_textbooks"
      options={{
        maxFiles: 1,
        clientAllowedFormats: ['pdf'],
        maxFileSize: 25_000_000,  // 25MB
        sources: ['local'],
      }}
      onSuccess={(result) => {
        const info = result.info
        if (info && typeof info === 'object') {
          onUpload(info.secure_url, info.public_id)
        }
      }}
    >
      {({ open }) => (
        <button onClick={() => open()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Upload chapter PDF
        </button>
      )}
    </CldUploadWidget>
  )
}
