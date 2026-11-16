import { Download, FlaskConical } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { APP_IS_PUBLIC, playStoreUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { T } from "./t";

/** The site's large button size, on top of shadcn's variants. */
export const bigButton = "h-auto gap-2 rounded-2xl px-6 py-3 text-base font-bold";

/** The Play Store button, or an invitation to /testers while the app is in testing. */
export function StoreButton({ referrer, onDark = false }) {
  if (!APP_IS_PUBLIC) {
    return (
      <Link
        href="/testers"
        className={cn(buttonVariants(), bigButton, onDark && "bg-white text-emerald-900 hover:bg-emerald-50")}
      >
        <FlaskConical />
        <T ur="ابتدائی ٹیسٹر بنیں" en="Become an early tester" />
      </Link>
    );
  }
  return (
    <a
      href={playStoreUrl(referrer)}
      className={cn(buttonVariants(), bigButton, onDark && "bg-white text-emerald-900 hover:bg-emerald-50")}
    >
      <Download />
      <T ur="Google Play سے ڈاؤن لوڈ کریں" en="Get it on Google Play" />
    </a>
  );
}
