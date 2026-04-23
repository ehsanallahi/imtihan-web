
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { checkPermission } from "@/lib/casbin";

export async function POST(req) {
  try {
    // 1. Authenticate and Check Permissions
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file");
    const subjectId = formData.get("subjectId");
    const chapterId = formData.get("chapterId");

    if (!file || !subjectId || !chapterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, 'imtihan/textbooks');

    // 5. Create Database Record
    const upload = await db.textbookUpload.create({
      data: {
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        originalName: file.name,
        uploadedById: session.user.id,
        subjectId: subjectId,
        chapterId: chapterId,
        mcqsGenerated: false,
      },
    });

    return NextResponse.json({ 
      message: "File uploaded successfully", 
      upload 
    });

  } catch (error) {
    console.error("[CMS_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}
