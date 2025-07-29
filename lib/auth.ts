
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1hr" });
}

export function verifyToken(token: string) : JwtPayload | null {
  try {
    return jwt.verify(token,JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
