import { defineConfig } from "@playwright/test";
import { writeFileSync } from "node:fs";
import path from "node:path";

const state = path.resolve("tests/.release-state.json");
writeFileSync(state, JSON.stringify({ version: "1.2.3" }));
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  timeout: 180000,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium" },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://127.0.0.1:3100/download",
    reuseExistingServer: false,
    timeout: 120000,
    env: { CDN_TEST_STATE: state, NODE_OPTIONS: `--import=${path.resolve("tests/mock-cdn.mjs")}` },
  },
});
