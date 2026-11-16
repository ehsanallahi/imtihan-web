"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LangToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.lang === "ur" ? "en" : "ur";
    root.dataset.lang = next;
    root.lang = next;
    root.dir = next === "ur" ? "rtl" : "ltr";
    try {
      localStorage.setItem("lang", next);
    } catch {}
  }

  return (
    <Button variant="outline" onClick={toggle} className="h-auto rounded-full px-4 py-1.5 font-semibold">
      <Languages />
      {/* Shows the language you would switch to. */}
      <span data-l="ur" lang="en">English</span>
      <span data-l="en" lang="ur">اردو</span>
    </Button>
  );
}
