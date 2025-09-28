import fs from "fs";
import path from "path";
import postcss from "postcss";
import { glob } from "glob";
import tailwind from "@tailwindcss/postcss";

async function build() {
  const files = await glob("./src/**/*.html");

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");

    // Extract Tailwind classes from the HTML
    const css = `@tailwind base; @tailwind components; @tailwind utilities;`;

    // Process with PostCSS + Tailwind
    const result = await postcss([tailwind]).process(css, {
      from: undefined,
    });

    // Inject compiled CSS into <style> in <head>
    const withCss = html.replace(
      /<\/head>/,
      `<style>${result.css}</style></head>`
    );

    const outPath = path.join("dist", path.basename(file));
    fs.mkdirSync("dist", { recursive: true });
    fs.writeFileSync(outPath, withCss, "utf8");

    console.log(`Built ${file} → ${outPath}`);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
