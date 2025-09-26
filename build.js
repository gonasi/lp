import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const inputDir = "./src";
const outputDir = "./dist";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function processHtmlFile(filePath) {
  const relPath = path.relative(inputDir, filePath);
  const outFile = path.join(outputDir, relPath);

  // Ensure destination folder exists
  ensureDir(path.dirname(outFile));

  // Generate CSS specific to this file
  const cssOut = path.join(outputDir, "tmp.css");
  execSync(
    `TAILWIND_CONTENT=${filePath} npx postcss src/styles.css -o ${cssOut}`,
    { stdio: "inherit" }
  );

  const css = fs.readFileSync(cssOut, "utf8");
  fs.unlinkSync(cssOut); // clean up tmp

  // Inject CSS into HTML
  const html = fs.readFileSync(filePath, "utf8");
  const withCss = html.replace("</head>", `<style>${css}</style></head>`);

  // Write final HTML file into dist
  fs.writeFileSync(outFile, withCss, "utf8");
  console.log("✅ Built:", outFile);
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      processHtmlFile(fullPath);
    }
  }
}

// Ensure dist exists before build
ensureDir(outputDir);
walkDir(inputDir);
