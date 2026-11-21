// main.ts — entrypoint for make.fun's "Post a GTA 6 meme on X" bounty.
//
// The grader runs `node /bot/main.ts` with this repository read-only at
// MAKEFUN_BOT_DIR and an empty, writable MAKEFUN_OUTPUT_DIR. The entry's
// deliverable is the X post named by POST.json at the repository root, so
// this driver reads that file, takes the post url it carries, and writes
// the same JSON into the output directory. Nothing here reads the clock,
// rolls dice or touches the network, so two runs produce identical bytes.

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function botDir(): string {
  const fromEnv = process.env.MAKEFUN_BOT_DIR;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return "/output";
}

// The url POST.json names, or "" when the file is missing or carries no
// string url: the run still completes, and stays deterministic.
function readPostUrl(dir: string): string {
  try {
    const raw = readFileSync(join(dir, "POST.json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return "";
    const url = (parsed as { url?: unknown }).url;
    return typeof url === "string" ? url : "";
  } catch {
    return "";
  }
}

function main(): void {
  const url = readPostUrl(botDir());
  const out = outputDir();
  mkdirSync(out, { recursive: true });
  // Write to a temp file in the same directory, then rename it over the
  // destination: a reader never sees a half-written POST.json, and the
  // final bytes are exactly what a direct write would produce.
  const target = join(out, "POST.json");
  const temp = join(out, "POST.json.tmp");
  writeFileSync(temp, JSON.stringify({ url }) + "\n", "utf8");
  renameSync(temp, target);
}

main();
