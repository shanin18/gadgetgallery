import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const protectedAccountPaths = ["/account", "/checkout"];
const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const csrfExemptApiPrefixes = ["/api/auth", "/api/webhooks"];

function redirectToLogin(request: Request, pathname: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/") &&
    mutatingMethods.has(request.method) &&
    !csrfExemptApiPrefixes.some((prefix) => pathname.startsWith(prefix)) &&
    !isSameOriginRequest(request)
  ) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (pathname.startsWith("/admin")) {
    if (!request.auth?.user || request.auth.user.role !== "ADMIN") {
      return redirectToLogin(request, pathname);
    }
  }

  if (protectedAccountPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!request.auth?.user) {
      return redirectToLogin(request, pathname);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.jpg|.*\\..*).*)"]
};
