// 사용: node sbq.mjs <env파일> <sql파일|-e "SQL"> — 토큰은 출력하지 않는다.
import fs from "node:fs";
const [envPath, ...rest] = process.argv.slice(2);
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token) { console.log("NO_TOKEN"); process.exit(1); }
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const query = rest[0] === "-e" ? rest[1] : fs.readFileSync(rest[0], "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
console.log(res.status, text.slice(0, 3000));
