import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const getBase = () => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }

  if (process.env.GITHUB_ACTIONS && repositoryName) {
    return `/${repositoryName}/`;
  }

  return "/";
};

// https://vite.dev/config/
export default defineConfig({
  base: getBase(),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
});
