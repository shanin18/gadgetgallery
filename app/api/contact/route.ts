import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/contact-email";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(4000)
});

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "contact", limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid contact message." }, { status: 400 });
  }

  const result = await sendContactEmail(parsed.data);

  if (!result.sent) {
    console.error("Contact message delivery failed.", result.reason);
    return NextResponse.json({ error: "Message could not be sent. Please try again later." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, provider: result.provider });
}
