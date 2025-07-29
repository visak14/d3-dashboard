import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import { User } from '../../../../../models/User';
import { signToken } from '../../../../../lib/auth';

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

 
const token = signToken({ id: user._id, email: user.email });

  const res = NextResponse.json({ message: 'Login successful' });
  res.cookies.set('token', token, { httpOnly: true });

  return res;
}
