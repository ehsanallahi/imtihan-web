import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { uploadToCloudinary } from "@/lib/cloudinary";

async function getAuthUser(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return await verifyToken(token);
}

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, 'imtihan/avatars');

    // Update user avatar
    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: {
        avatar: result.secure_url,
        avatarId: result.public_id,
      },
    });

    return NextResponse.json({
      message: "Avatar updated successfully",
      avatarUrl: updatedUser.avatar,
    });
  } catch (error) {
    console.error("[POST_USER_AVATAR_ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
