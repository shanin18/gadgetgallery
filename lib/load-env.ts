import { config } from "dotenv";

config({ path: ".env.local", override: false, quiet: true });
config({ path: ".env", override: false, quiet: true });

function normalizePostgresSslMode(value: string) {
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) return value;
    if (url.searchParams.get("uselibpqcompat") === "true") return value;

    const sslMode = url.searchParams.get("sslmode");
    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }

    return value;
  } catch {
    return value;
  }
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizePostgresSslMode(process.env.DATABASE_URL);
}
