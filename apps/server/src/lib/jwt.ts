import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@chore-store/shared";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}
