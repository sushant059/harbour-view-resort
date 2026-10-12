import { SignJWT, jwtVerify } from "jose";

function secret() {
  const value = process.env.AUTH_SECRET || (process.env.NODE_ENV !== "production" ? "dev-only-harbour-view-secret" : "");
  if (!value || value.length < 16) {
    throw new Error("Set AUTH_SECRET to a random string of at least 16 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function signAdminToken(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  if (payload.role !== "admin" || typeof payload.email !== "string") return null;
  return { email: payload.email };
}
