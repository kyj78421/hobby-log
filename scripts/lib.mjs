import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const ENV_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
export const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
export const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const ref = new URL(URL_).hostname.split(".")[0];
export async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await r.json();
  if (!r.ok) throw new Error(`SQL ${r.status}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}
export const randPw = () => crypto.randomBytes(12).toString("base64url") + "Aa1!";
export async function createTestUser(email, password) {
  const [u] = await sql(`
    with u as (
      insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
        raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
      values ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','${email}',
        crypt('${password}',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','')
      returning id)
    insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    select id::text,id,jsonb_build_object('sub',id::text,'email','${email}','email_verified',true),'email',now(),now(),now() from u
    returning user_id`);
  return u.user_id;
}
export const deleteTestUsers = () => sql(`delete from auth.users where email like 'hl-test-%@example.com'`);
export async function signIn(email, password) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return { status: r.status, body: await r.json() };
}
export async function rest(path, token, init = {}) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${token ?? KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  });
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
}
