import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY, SUPPORT_EMAIL } from "@/lib/site";
import { LangToggle } from "./lang-toggle";
import { T } from "./t";

const NAV = [
  { href: "/#features", ur: "خصوصیات", en: "Features" },
  { href: "/#boards", ur: "بورڈ", en: "Boards" },
  { href: "/#parents", ur: "والدین", en: "Parents" },
  { href: "/#faq", ur: "سوالات", en: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-extrabold text-emerald-900">
            <T ur="امتحان" en="Imtihan" />
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-emerald-800">
              <T ur={item.ur} en={item.en} />
            </a>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  );
}

const FOOTER_LINKS = [
  { href: "/privacy", ur: "رازداری کی پالیسی", en: "Privacy" },
  { href: "/terms", ur: "استعمال کی شرائط", en: "Terms" },
  { href: "/delete-account", ur: "اکاؤنٹ حذف کریں", en: "Delete account" },
  { href: "/contact", ur: "رابطہ", en: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-emerald-950 text-emerald-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-extrabold text-white">
            <T ur="امتحان" en="Imtihan" />
          </p>
          <p className="mt-1 text-sm text-emerald-200">
            <T
              ur={`پاکستان کے میٹرک طلبہ کے لیے امتحان کی تیاری۔ ${COMPANY} کی پروڈکٹ۔`}
              en={`Exam prep for Matric students in Pakistan. A product of ${COMPANY}.`}
            />
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="mt-2 inline-block text-sm underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              <T ur={item.ur} en={item.en} />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/** A centred card for the small single-message pages. */
export function Notice({ title, children }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16">
      <Card className="rounded-3xl py-8 text-center text-base shadow-sm">
        <CardHeader className="px-8">
          <CardTitle className="text-2xl font-extrabold text-emerald-900">
            <h1>{title}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-8 text-muted-foreground">{children}</CardContent>
      </Card>
    </main>
  );
}
