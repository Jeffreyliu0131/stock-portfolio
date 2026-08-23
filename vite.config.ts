import vinext from "vinext";
import { defineConfig } from "vite";

// The public snapshot intentionally has no production Sites manifest,
// database binding, or account-owned deployment configuration.
export default defineConfig({
  plugins: [vinext()],
});
