import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";

type JwtPayload = {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ email: null });

  const decoded = verifyToken(token) as JwtPayload;
  return NextResponse.json({ email: decoded?.email || "User" });
}
