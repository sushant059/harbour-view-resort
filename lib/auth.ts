import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signAdminToken, verifyAdminToken } from "@/lib/auth-token";

const COOKIE = "snt_admin";

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function setSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, await signAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function devAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return "resort-demo";
  return "";
}
