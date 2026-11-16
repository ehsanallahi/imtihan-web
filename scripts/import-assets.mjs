// One-off: copies screenshots, icon and legal text from the app repo.
// Run from the project root: node scripts/import-assets.mjs <path-to-imtihan_mobile_app>
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const app = process.argv[2];
if (!app) throw new Error("Pass the path to imtihan_mobile_app");

const shots = ["01-today", "02-learn", "03-quiz", "04-urdu", "05-ai-tutor", "06-progress"];
for (const name of shots) {
  await sharp(path.join(app, "docs/branding/play-store", `${name}.png`))
    .resize({ width: 640 })
    .webp({ quality: 82 })
    .toFile(`public/screens/${name}.webp`);
}
fs.copyFileSync(path.join(app, "docs/branding/play-store-icon-512.png"), "app/icon.png");
await sharp(path.join(app, "docs/branding/play-store-icon-512.png")).resize(96).png().toFile("public/logo.png");
fs.copyFileSync(path.join(app, "docs/branding/play-store/feature-graphic-1024x500.png"), "public/og.png");

for (const page of ["privacy", "terms", "delete-account"]) {
  const html = fs.readFileSync(path.join(app, "hosting", `${page}.html`), "utf8");
  for (const lang of ["en", "ur"]) {
    const match = html.match(new RegExp(`<section lang="${lang}">([^]*?)</section>`));
    if (!match) throw new Error(`${page}: no ${lang} section`);
    fs.writeFileSync(`content/legal/${page}.${lang}.html`, match[1].trim() + "\n");
  }
}
console.log("done");
