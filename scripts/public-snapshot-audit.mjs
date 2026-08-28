import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const MAX_SCANNED_FILE_BYTES = 2_000_000;

const paths = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

const forbiddenPathPatterns = [
  /(^|\/)\.env(?:\.|$)/u,
  /(^|\/).*\.(?:db|sqlite|sqlite3|har|log|pem|p12|key)$/iu,
  /(^|\/)stock-portfolio-backup-.*\.json$/iu,
  /(^|\/)portfolio-export-.*\.json$/iu,
  /(^|\/)broker-export-.*\.csv$/iu,
];

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /AKIA[0-9A-Z]{16}/u,
  /AIza[0-9A-Za-z_-]{30,}/u,
  /sk-[A-Za-z0-9_-]{20,}/u,
  /gh[pousr]_[A-Za-z0-9]{30,}/u,
  /xox[baprs]-[A-Za-z0-9-]{20,}/u,
];

const publicClientSecretPattern =
  /(?:NEXT_PUBLIC_|VITE_)[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD)/u;

const failures = [];
for (const path of paths) {
  if (
    path !== ".env.example" &&
    forbiddenPathPatterns.some((pattern) => pattern.test(path))
  ) {
    failures.push(`${path}: private-data filename must not be published`);
    continue;
  }

  const stats = statSync(path);
  if (!stats.isFile() || stats.size > MAX_SCANNED_FILE_BYTES) {
    continue;
  }

  const content = readFileSync(path, "utf8");
  if (content.includes("\0")) {
    continue;
  }
  if (secretPatterns.some((pattern) => pattern.test(content))) {
    failures.push(`${path}: content resembles a live credential`);
  }
  if (publicClientSecretPattern.test(content)) {
    failures.push(`${path}: server credential is exposed through a public client prefix`);
  }
}

const envExample = readFileSync(".env.example", "utf8");
for (const name of [
  "DEEPSEEK_API_KEY",
  "OPENAI_API_KEY",
  "ALPACA_API_KEY_ID",
  "ALPACA_API_SECRET_KEY",
]) {
  const match = envExample.match(new RegExp(`^${name}=(.*)$`, "mu"));
  if (match === null || !match[1]?.startsWith("replace-with-")) {
    failures.push(`.env.example: ${name} must contain a non-secret placeholder`);
  }
}

if (failures.length > 0) {
  console.error("Public snapshot audit failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Public snapshot audit passed for ${paths.length} publishable files.`);
}
