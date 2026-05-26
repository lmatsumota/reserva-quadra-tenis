import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "rq_session";
const COOKIE = SESSION_COOKIE;
const MAX_AGE = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  venueId: string | null;
};

function secret() {
  const s = process.env.SESSION_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    venueId: user.venueId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: (payload.name as string) ?? "",
      role: payload.role as UserRole,
      venueId: (payload.venueId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

/** Define o cookie de sessão no Response retornado (obrigatório em Route Handlers no Next 15). */
export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE, token, sessionCookieOptions());
  return response;
}

export function clearSessionOnResponse(response: NextResponse) {
  response.cookies.set(COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function isAdmin(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "VENUE_ADMIN";
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdmin(session.role)) throw new Error("FORBIDDEN");
  return session;
}
