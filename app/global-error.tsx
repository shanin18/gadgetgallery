"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error boundary caught an error.", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f9fb", color: "#111827", padding: 20, fontFamily: "Arial, sans-serif" }}>
          <section style={{ width: "min(520px, 100%)", padding: 20, textAlign: "center" }}>
            <Image src="/brand/gadget-gallery-logo.png" alt="GadgetGallery" width={76} height={76} style={{ margin: "0 auto", objectFit: "contain" }} />
            <p style={{ margin: "20px 0 0", color: "#159487", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Temporary issue</p>
            <h1 style={{ margin: "8px 0 0", fontSize: 34, lineHeight: 1.12 }}>GadgetGallery needs a refresh</h1>
            <p style={{ margin: "14px auto 0", maxWidth: 420, color: "#5f6b7a", fontSize: 15, lineHeight: 1.6 }}>
              We could not complete this request. Your information is protected, and no technical error details are shown here.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                onClick={reset}
                style={{ height: 42, cursor: "pointer", border: 0, borderRadius: 6, background: "#159487", color: "#ffffff", padding: "0 18px", fontSize: 14, fontWeight: 800 }}
              >
                Try again
              </button>
              <Link href="/" style={{ height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9e2e7", borderRadius: 6, color: "#111827", padding: "0 18px", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
                Go home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
