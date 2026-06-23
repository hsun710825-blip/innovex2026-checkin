const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  const { kv } = require("@vercel/kv");
  const key = "innovex2026:checkins";
  const before = await kv.lrange(key, 0, -1);
  console.log(`Before: ${before.length} record(s)`);
  await kv.del(key);
  const after = await kv.lrange(key, 0, -1);
  console.log(`After: ${after.length} record(s)`);
  console.log("All check-in data cleared.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
