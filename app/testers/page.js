import { ExternalLink } from "lucide-react";

import { bigButton } from "@/components/store-button";
import { T } from "@/components/t";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_EMAIL, TESTERS_GROUP_URL, TESTERS_OPT_IN_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Become an early tester",
  description: "Try the Imtihan app before it is public: join the testers group, opt in on Google Play and install.",
};

// Play's closed test: joining the Google Group makes an account eligible, the
// opt-in link turns testing on for it, and the app then installs from Play.
const STEPS = [
  {
    ur: ["ٹیسٹرز گروپ میں شامل ہوں", "وہی Gmail استعمال کریں جو آپ کے Android فون پر ہے۔", "گروپ میں شامل ہوں"],
    en: ["Join the testers group", "Use the Gmail that is on your Android phone.", "Join the group"],
    href: TESTERS_GROUP_URL,
  },
  {
    ur: ["ٹیسٹر بنیں", "اسی فون پر یہ لنک کھولیں اور “Become a tester” دبائیں۔", "ٹیسٹنگ لنک کھولیں"],
    en: ["Become a tester", "Open this link on the same phone and tap “Become a tester”.", "Open the testing link"],
    href: TESTERS_OPT_IN_URL,
  },
  {
    ur: ["ایپ انسٹال کریں", "اسی صفحے پر “Download it on Google Play” دبائیں اور انسٹال کریں۔"],
    en: ["Install the app", "On that same page, tap “Download it on Google Play” and install."],
  },
];

export default function Testers() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14">
      <h1 className="text-center text-3xl font-extrabold text-emerald-900">
        <T ur="ابتدائی ٹیسٹر بنیں" en="Become an early tester" />
      </h1>
      <p className="mt-3 text-center text-lg text-muted-foreground">
        <T
          ur="امتحان ایپ ابھی آزمائش کے مرحلے میں ہے۔ تین آسان مرحلوں میں اسے سب سے پہلے آزمائیں۔"
          en="Imtihan is still being tested. Try it before everyone else, in three steps."
        />
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.en[0]} data-reveal style={{ "--delay": `${i * 100}ms` }}>
            <Card className="rounded-3xl py-6 shadow-sm">
              <CardHeader className="grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-6">
                <span className="row-span-3 flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <CardTitle className="text-lg font-bold text-emerald-900">
                  <h2><T ur={step.ur[0]} en={step.en[0]} /></h2>
                </CardTitle>
                <CardDescription className="text-base">
                  <T ur={step.ur[1]} en={step.en[1]} />
                </CardDescription>
                {step.href && (
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener"
                    className={cn(buttonVariants(), bigButton, "mt-3 w-fit")}
                  >
                    <T ur={step.ur[2]} en={step.en[2]} />
                    <ExternalLink />
                  </a>
                )}
              </CardHeader>
            </Card>
          </li>
        ))}
      </ol>

      <ul className="mt-8 list-disc space-y-1 ps-6 text-muted-foreground">
        <li>
          <T
            ur="ابھی صرف پنجاب بورڈ کی جماعت نہم کے سوالات دستیاب ہیں۔"
            en="Only Punjab Board Class 9 has questions so far."
          />
        </li>
        <li>
          <T
            ur="ایپ صرف Android کے لیے ہے، اور آپ کی عمر کم از کم 13 سال ہونی چاہیے۔"
            en="The app is for Android only, and you must be at least 13."
          />
        </li>
        <li>
          <T ur="کوئی مسئلہ نظر آئے یا کوئی تجویز ہو تو ہمیں لکھیں: " en="Found a problem or have an idea? Write to us: " />
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="font-semibold text-primary underline underline-offset-4">
            {SUPPORT_EMAIL}
          </a>
        </li>
      </ul>
    </main>
  );
}
