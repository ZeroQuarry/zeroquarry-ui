#!/usr/bin/env node
/**
 * Concatenate src/js/*.js (in dependency order) into dist/zeroquarry-ui.js.
 * Zero dependencies. Each file is a self-contained IIFE hanging behaviour off
 * window.ZQ; boot.js must come last because it calls them.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORDER = ["dialog.js", "tabs.js", "disclosure.js", "boot.js"];

const missing = ORDER.filter((f) => !existsSync(join(ROOT, "src", "js", f)));
if (missing.length) {
  console.error(`build-js: missing source file(s): ${missing.join(", ")}`);
  process.exit(1);
}

const body = ORDER
  .map((f) => readFileSync(join(ROOT, "src", "js", f), "utf8").trimEnd())
  .join("\n\n");

const out = `/* zeroquarry-ui — behaviours bundle. DO NOT EDIT.
   Source: src/js/*.js   Build: npm run build */\n\n${body}\n`;

mkdirSync(join(ROOT, "dist"), { recursive: true });
writeFileSync(join(ROOT, "dist", "zeroquarry-ui.js"), out);
console.log(`zeroquarry-ui.js written — ${ORDER.length} behaviour file(s): ${ORDER.join(", ")}`);
