#!/usr/bin/env node
/**
 * Bundle dist/tokens.css + src/css/*.css into dist/zeroquarry-ui.css.
 * Zero dependencies. Component files are concatenated in filename order.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_DIR = join(ROOT, "src", "css");

const tokens = readFileSync(join(ROOT, "dist", "tokens.css"), "utf8");
const files = readdirSync(CSS_DIR).filter((f) => f.endsWith(".css")).sort();

const parts = [tokens.trimEnd()];
for (const f of files) {
  const text = readFileSync(join(CSS_DIR, f), "utf8").trimEnd();
  parts.push(`/* ==== ${f} ${"=".repeat(Math.max(0, 60 - f.length))} */\n${text}`);
}

const out = `/* zeroquarry-ui — generated bundle. DO NOT EDIT.
   Source: tokens/*.json + src/css/*.css   Build: npm run build */\n\n`
  + parts.join("\n\n") + "\n";

mkdirSync(join(ROOT, "dist"), { recursive: true });
writeFileSync(join(ROOT, "dist", "zeroquarry-ui.css"), out);
console.log(`zeroquarry-ui.css written — tokens + ${files.length} component file(s): ${files.join(", ")}`);
