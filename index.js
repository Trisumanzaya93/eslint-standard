#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const cwd = process.cwd();

console.log("🔧 Injecting ESLint standard...\n");

// 1. Pastikan package.json ada
const pkgPath = path.join(cwd, "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("❌ package.json not found. Run this inside a project.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// 2. Inject scripts
pkg.scripts ||= {};
pkg.scripts.lint = "eslint src";
pkg.scripts["lint:fix"] = "eslint src --fix";

// 3. Inject devDependencies
pkg.devDependencies ||= {};
Object.assign(pkg.devDependencies, {
  eslint: "^9",
  "@typescript-eslint/parser": "^8",
  "@typescript-eslint/eslint-plugin": "^8",
  "eslint-plugin-react": "^7",
  "eslint-plugin-react-hooks": "^4"
});

// 4. Save package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// 5. Copy eslint.config.mjs
const configTarget = path.join(cwd, "eslint.config.mjs");
const template = fs.readFileSync(
  new URL("./eslint.config.mjs.template", import.meta.url),
  "utf-8"
);

fs.writeFileSync(configTarget, template);
console.log("✏️ eslint.config.mjs overwritten with standard config");

// 6. Install deps
console.log("📦 Installing dependencies...\n");
execSync("npm install", { stdio: "inherit" });

console.log("\n✅ ESLint standard injected successfully!");
