import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "rq_session";

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "dev-secret-change-in-production"
  );
}

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);

  if (pathname.startsWith("/admin")) {
    if (!role || (role !== "SUPER_ADMIN" && role !== "VENUE_ADMIN")) {
      const url = req.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/minhas-reservas") && !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/minhas-reservas"],
};
