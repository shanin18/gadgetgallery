import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

async function getHandlers() {
  const { handlers } = await import("@/lib/auth");
  return handlers;
}

function authJsonFallback(request: NextRequest, error: unknown) {
  const url = new URL(request.url);
  console.error("Auth route failed.", error);

  if (url.pathname.endsWith("/session")) {
    return NextResponse.json(null);
  }

  if (url.pathname.endsWith("/providers")) {
    return NextResponse.json({});
  }

  if (url.pathname.endsWith("/csrf")) {
    return NextResponse.json({ csrfToken: "" });
  }

  return NextResponse.json({ error: "Authentication service unavailable." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const handlers = await getHandlers();
    return handlers.GET(request);
  } catch (error) {
    return authJsonFallback(request, error);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { name: "auth", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const handlers = await getHandlers();
    return handlers.POST(request);
  } catch (error) {
    return authJsonFallback(request, error);
  }
}
