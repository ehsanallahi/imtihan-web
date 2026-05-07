import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { 
  mapGrade, 
  mapBoard, 
  mapGradeToFlutter, 
  mapBoardToFlutter,
  mapMedium,
  mapMediumToFlutter
} from "@/lib/mappings";

async function getAuthUser(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return await verifyToken(token);
}

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isPremium: user.role === 'premium_student' || user.role === 'super_admin',
      grade: mapGradeToFlutter(user.studentProfile?.grade),
      board: mapBoardToFlutter(user.studentProfile?.board),
      medium: mapMediumToFlutter(user.studentProfile?.medium),
    });
  } catch (error) {
    console.error("[GET_USER_ME_ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, grade, board, medium } = body;

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: {
        name: name,
        studentProfile: {
          upsert: {
            create: {
              grade: mapGrade(grade),
              board: mapBoard(board),
              medium: mapMedium(medium),
            },
            update: {
              grade: mapGrade(grade),
              board: mapBoard(board),
              medium: mapMedium(medium),
            },
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      isPremium: updatedUser.role === 'premium_student' || updatedUser.role === 'super_admin',
      grade: mapGradeToFlutter(updatedUser.studentProfile?.grade),
      board: mapBoardToFlutter(updatedUser.studentProfile?.board),
      medium: mapMediumToFlutter(updatedUser.studentProfile?.medium),
    });
  } catch (error) {
    console.error("[POST_USER_ME_ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
