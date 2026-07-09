// Bootstrap the first admin using only the anon key.
// Requires email confirmation to be OFF during bootstrap (see chat instructions).
//
// Usage:
//   node scripts/bootstrap-admin.mjs "<email>" "<password>" "<full name>"
//
// Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env
// (loaded from .env.local by the runner).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] ?? "";

if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY in env.");
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node scripts/bootstrap-admin.mjs "<email>" "<password>" "<full name>"');
  process.exit(1);
}

const supabase = createClient(url, anon);

// 1) Create the user (or reuse if it already exists).
let { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } },
});

if (error && !/already registered/i.test(error.message)) {
  console.error("signUp failed:", error.message);
  process.exit(1);
}

// 2) Ensure we have an authenticated session.
if (!data?.session) {
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    console.error(
      "signIn failed:",
      signIn.error.message,
      "\n(If it mentions email confirmation, disable 'Confirm email' in Supabase Auth and retry.)",
    );
    process.exit(1);
  }
  data = signIn.data;
}

const uid = data.user.id;

// 3) Promote to admin (allowed by the self-update RLS policy for own row).
const { error: upErr } = await supabase
  .from("profiles")
  .update({ role: "admin", full_name: fullName })
  .eq("id", uid);

if (upErr) {
  console.error("Promote to admin failed:", upErr.message);
  process.exit(1);
}

// 4) Verify.
const { data: profile } = await supabase
  .from("profiles")
  .select("email, full_name, role")
  .eq("id", uid)
  .single();

console.log("✅ Admin ready:", profile);
