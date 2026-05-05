import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { mapGradeToFlutter, mapBoardToFlutter } from "@/lib/mappings";


export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Format user for Flutter app
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      grade: mapGradeToFlutter(user.studentProfile?.grade),
      board: mapBoardToFlutter(user.studentProfile?.board),
    };

    return NextResponse.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
