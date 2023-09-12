import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import vue from "@vitejs/plugin-vue";
import pkg from "./package.json";
import { rmSync } from "fs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

rmSync("dist-electron", { recursive: true, force: true });
const sourcemap = !!process.env.VSCODE_DEBUG;
const isBuild = process.argv.slice(2).includes("build");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue"],
      dts: true,
    }),
    Components({
      dts: true,
    }),
    vue(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: "electron/main.ts",
        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: "dist-electron",
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
              output: {
                chunkFileNames: `[hash].js`,
              },
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload();
        },
        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: "dist-electron",
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
        },
      },
    ]),
    renderer(),
  ],
});
