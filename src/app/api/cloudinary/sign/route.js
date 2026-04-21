import cloudinary from '@/lib/cloudinary'
import { authorize } from '@/lib/auth-guards'

export async function POST(req) {
    const { paramsToSign } = await req.json()
    
    // Determine the required permission based on the targeting folder
    const folder = paramsToSign.folder || ""
    let resource = "textbook_upload"
    
    if (folder.includes("past-papers")) {
        resource = "past_paper"
    }

    const authResult = await authorize(resource, "write")
    
    if (authResult.error) {
        return Response.json({ error: authResult.error }, { status: authResult.status })
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    )
    
    return Response.json({ signature })
}