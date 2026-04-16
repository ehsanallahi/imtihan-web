import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
    // Only allow authenticated users to get a signature
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json(
        { error: 'Unauthorized' }, { status: 401 }
    )

    const { paramsToSign } = await req.json()
    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    )
    return NextResponse.json({ signature })
}