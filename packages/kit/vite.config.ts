import { dirname, relative, resolve } from "node:path";
import { readdir, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

const root = dirname(fileURLToPath(import.meta.url));

function posixRelative(fromDir: string, toFile: string): string {
  const rel = relative(fromDir, toFile).split("\\").join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const next = resolve(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walkFiles(next)));
    else out.push(next);
  }
  return out;
}

/**
 * Rolldown emits CSS assets and JS class maps but does not import the CSS.
 * Next.js re-scopes any `*.module.css` import from node_modules, which would
 * desync Vite's hashed class names — emit those files as `*.kit.css` instead.
 */
function importEmittedCss(): Plugin {
  return {
    name: "import-emitted-css",
    generateBundle(_options, bundle) {
      const cssFiles = Object.keys(bundle).filter((name) => name.endsWith(".css"));
      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type !== "chunk") continue;
        const dir = dirname(fileName);
        const candidates: string[] = [];
        if (fileName.endsWith(".module.js")) {
          candidates.push(fileName.replace(/\.module\.js$/, ".module.css"));
        }
        if (fileName.endsWith("src/tokens.js")) {
          candidates.push("lib/tokens.css");
        }
        for (const css of candidates) {
          if (!cssFiles.includes(css)) continue;
          const spec = posixRelative(dir, css).replace(/\.module\.css$/, ".kit.css");
          if (item.code.includes(`"${spec}"`)) continue;
          item.code = `import "${spec}";\n${item.code}`;
        }
      }
    },
    async closeBundle() {
      const dist = resolve(root, "dist");
      for (const file of await walkFiles(dist)) {
        if (!file.endsWith(".module.css")) continue;
        await rename(file, file.replace(/\.module\.css$/, ".kit.css"));
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src", "ui", "css-modules.d.ts"],
      tsconfigPath: resolve(root, "tsconfig.json"),
    }),
    importEmittedCss(),
  ],
  build: {
    lib: {
      entry: resolve(root, "src/index.ts"),
      formats: ["es"],
    },
    sourcemap: true,
    cssCodeSplit: true,
    cssMinify: false,
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      plugins: [preserveDirectives()],
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "embla-carousel-react",
        /^lucide-react(?:\/|$)/,
        /^next(?:\/|$)/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: root,
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
