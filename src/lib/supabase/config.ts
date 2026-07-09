/**
 * Public Supabase connection config.
 *
 * The anon key is designed to be exposed to the browser (RLS enforces security),
 * so shipping it in the client bundle is expected and safe. We keep clean
 * constants here to avoid env-var copy/paste corruption (a stray non-ASCII
 * character in a header value breaks fetch). An env var overrides the constant
 * only when it's present and well-formed after sanitization.
 */

const FALLBACK_URL = "https://zrukgoerlcsuhoppmsgc.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydWtnb2VybGNzdWhvcHBtc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NTEwOTQsImV4cCI6MjA5OTEyNzA5NH0.OPILCyUqhTKoHj5BuQoKKr5HgdPR674HpilHPclOfIU";

/** Remove anything outside printable ASCII (strips injected unicode/whitespace). */
function sanitize(value: string | undefined | null): string {
  return (value ?? "").replace(/[^\x21-\x7E]/g, "");
}

function pickUrl(): string {
  const fromEnv = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return fromEnv.startsWith("https://") && fromEnv.endsWith(".supabase.co")
    ? fromEnv
    : FALLBACK_URL;
}

function pickAnonKey(): string {
  const fromEnv = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // Trust env only if, after sanitization, it EXACTLY matches the known-good key.
  // This tolerates an env var polluted with invisible/unicode characters (the
  // sanitizer strips them) while never using a subtly-wrong key by mistake.
  return fromEnv === FALLBACK_ANON_KEY ? fromEnv : FALLBACK_ANON_KEY;
}

export const SUPABASE_URL = pickUrl();
export const SUPABASE_ANON_KEY = pickAnonKey();
