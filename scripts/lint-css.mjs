#!/usr/bin/env node
/**
 * Craft guard for the design system's own stylesheets.
 *
 *   1. No raw colour literals (#hex / rgb() / hsl()) in src/css/*.css —
 *      components must reference --zq-* tokens so theming keeps working.
 *   2. Every var(--zq-*) referenced anywhere in src/css must be defined by
 *      the built token layer.
 *   3. Every component class must be namespaced `.zq-`.
 *
 * The var() check matches the guard the app itself runs
 * (ZeroQuarry/tests/test_css_tokens.py).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_DIR = join(ROOT, "src", "css");
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const tokensCss = strip(readFileSync(join(ROOT, "dist", "tokens.css"), "utf8"));
const defined = new Set([...tokensCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

const files = readdirSync(CSS_DIR).filter((f) => f.endsWith(".css")).sort();
const problems = [];

for (const f of files) {
  const text = strip(readFileSync(join(CSS_DIR, f), "utf8"));

  // 1. raw colour literals
  for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) {
    problems.push(`${f}: raw colour literal "${m[0]}" — use a --zq-* token`);
  }

  // 2. undefined token references
  for (const m of text.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    if (!defined.has(m[1])) problems.push(`${f}: undefined token var(${m[1]})`);
  }

  // 3. class namespacing
  for (const m of text.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
    if (!m[1].startsWith("zq-")) {
      problems.push(`${f}: class .${m[1]} is not namespaced (.zq-)`);
    }
  }
}

if (problems.length) {
  console.error(`lint-css: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`lint-css: clean (${files.length} files, ${defined.size} tokens defined)`);
