import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/casbin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req, props) {
  try {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { board, grade, year, medium, subjectId } = body;

    const updated = await db.pastPaperUpload.update({
      where: { id },
      data: {
        ...(board && { board }),
        ...(grade && { grade }),
        ...(year && { year: parseInt(year) }),
        ...(medium && { medium }),
        ...(subjectId && { subjectId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PAST_PAPER_UPDATE_ERROR]:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, props) {
  try {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 1. Get upload to get cloudinary ID
    const upload = await db.pastPaperUpload.findUnique({ where: { id } });
    if (!upload) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 2. Delete from Cloudinary
    if (upload.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(upload.cloudinaryId, { resource_type: "raw" });
      } catch (e) {
        console.error("[CLOUDINARY_DELETE_ERROR]:", e);
      }
    }

    // 3. Delete associated MCQs first to avoid foreign key constraints
    await db.pastPaperMCQ.deleteMany({ where: { pastPaperUploadId: id } });

    // 4. Delete from DB
    await db.pastPaperUpload.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("[PAST_PAPER_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
