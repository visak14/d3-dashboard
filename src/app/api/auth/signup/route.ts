
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "../../../../../models/User";
import { connectDB } from "../../../../../lib/mongodb";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const userExists = await User.findOne({ email });
  if (userExists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  return NextResponse.json({ message: 'Signup successful' });
}