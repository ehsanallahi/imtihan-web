import fs from "node:fs";
import path from "node:path";

// Legal text lives in content/legal as HTML, imported from the app repo by
// scripts/import-assets.mjs. Both languages always show, English first, so a
// store reviewer sees the English text without touching the language switch.
function read(name, lang) {
  return fs.readFileSync(path.join(process.cwd(), "content/legal", `${name}.${lang}.html`), "utf8");
}

export function LegalPage({ name }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <section lang="en" dir="ltr" className="legal" dangerouslySetInnerHTML={{ __html: read(name, "en") }} />
      <section
        lang="ur"
        dir="rtl"
        className="legal mt-12 border-t border-slate-200 pt-8"
        dangerouslySetInnerHTML={{ __html: read(name, "ur") }}
      />
    </main>
  );
}
