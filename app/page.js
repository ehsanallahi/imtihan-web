import Image from "next/image";
import Link from "next/link";

import { BookOpenCheck, CalendarCheck, Camera, Flame, Languages, Layers, Sparkles } from "lucide-react";

import { TiltStage } from "@/components/motion";
import { StoreButton } from "@/components/store-button";
import { T } from "@/components/t";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_IS_PUBLIC, BOARDS, SUPPORT_EMAIL } from "@/lib/site";

const FEATURES = [
  {
    ur: ["ہر دن کا مطالعہ پلان", "ایپ آپ کے کمزور موضوعات دیکھ کر بتاتی ہے کہ آج کیا پڑھنا ہے۔"],
    icon: CalendarCheck,
    en: ["A study plan for every day", "The app looks at your weak topics and tells you what to study today."],
  },
  {
    ur: ["باب وار کوئز اور موک امتحان", "ہر سوال کے ساتھ وضاحت، اور نتیجہ فوراً۔"],
    icon: BookOpenCheck,
    en: ["Chapter quizzes and mock exams", "Every question comes with an explanation, and you see your result straight away."],
  },
  {
    ur: ["AI ٹیوٹر", "کوئی بھی سوال لکھیں اور مرحلہ وار جواب پائیں۔ روزانہ 5 سوال مفت۔"],
    icon: Sparkles,
    en: ["AI tutor", "Type any question and get a step-by-step answer. 5 free questions a day."],
  },
  {
    ur: ["کتاب کا سوال اسکین کریں", "کتاب کے سوال کی تصویر لیں اور اس کا حل دیکھیں۔ روزانہ 3 اسکین مفت۔"],
    icon: Camera,
    en: ["Scan a textbook question", "Take a photo of a question from your book and see it solved. 3 free scans a day."],
  },
  {
    ur: ["فلیش کارڈز اور بُک مارک", "اہم نکات فلیش کارڈز سے دہرائیں اور مشکل سوال بعد کے لیے محفوظ کریں۔"],
    icon: Layers,
    en: ["Flashcards and bookmarks", "Revise key points with flashcards and save hard questions for later."],
  },
  {
    ur: ["اردو اور انگریزی", "ایک بٹن سے زبان بدلیں، جس میں آپ کو آسانی ہو۔"],
    icon: Languages,
    en: ["Urdu and English", "Switch language with one tap, whichever you find easier."],
  },
];

const SCREENS = [
  ["01-today", "Today screen with streak, days to the board exam and today's plan"],
  ["02-learn", "Learn screen listing subjects and chapters"],
  ["03-quiz", "A quiz question with answer options"],
  ["04-urdu", "The app in Urdu"],
  ["05-ai-tutor", "AI tutor answering a biology question"],
  ["06-progress", "Progress screen with streak, exam readiness and topics to practise"],
];

const STEPS = [
  {
    ur: ["مختصر ٹیسٹ دیں", "یہ آپ کے مضبوط اور کمزور موضوعات معلوم کرتا ہے۔"],
    en: ["Take a short test", "It finds the topics you are strong and weak in."],
  },
  {
    ur: ["روزانہ کے پلان پر عمل کریں", "ہر دن چند موضوعات، آپ کے لیے چنے ہوئے۔"],
    en: ["Follow your daily plan", "A few topics each day, chosen for you."],
  },
  {
    ur: ["مشق کریں اور پیش رفت دیکھیں", "جیسے جیسے آپ بہتر ہوتے ہیں، آپ کی تیاری کا اسکور بڑھتا ہے۔"],
    en: ["Practise and watch your progress", "Your exam readiness score rises as you improve."],
  },
];

const FAQ = [
  {
    ur: ["کیا امتحان مفت ہے؟", "جی ہاں، لانچ کے دوران ایپ مفت ہے اور کسی ادائیگی کا تقاضا نہیں کرتی۔ AI ٹیوٹر کی روزانہ حد ہے: 5 سوال اور 3 اسکین۔"],
    en: ["Is Imtihan free?", "Yes. The app is free during launch and does not ask for payment. The AI tutor has daily limits: 5 questions and 3 scans."],
  },
  {
    ur: ["کون سے بورڈ اور جماعتیں دستیاب ہیں؟", "ابھی پنجاب بورڈ کی جماعت نہم دستیاب ہے۔ باقی بورڈ اور جماعت دہم پر کام جاری ہے۔"],
    en: ["Which boards and classes are available?", "Punjab Board Class 9 is available now. Other boards and Class 10 are being added."],
  },
  {
    ur: ["ایپ کہاں سے ملے گی؟", APP_IS_PUBLIC ? "ایپ Google Play پر دستیاب ہے۔" : "ایپ ابھی آزمائش کے مرحلے میں ہے اور جلد Google Play پر سب کے لیے آ رہی ہے۔ تب تک آپ ابتدائی ٹیسٹر بن کر اسے آزما سکتے ہیں۔"],
    en: ["Where do I get the app?", APP_IS_PUBLIC ? "The app is on Google Play." : "The app is being tested and is coming to Google Play for everyone soon. Until then you can try it as an early tester."],
  },
  {
    ur: ["کیا یہ iPhone پر چلتی ہے؟", "ابھی ایپ صرف Android کے لیے ہے۔"],
    en: ["Does it work on iPhone?", "For now the app is for Android only."],
  },
  {
    ur: ["کیا ایپ میں اشتہارات ہیں؟", "نہیں۔ ہم اشتہارات نہیں دکھاتے اور آپ کا ڈیٹا فروخت نہیں کرتے۔"],
    en: ["Does the app show ads?", "No. We do not show ads and we do not sell your data."],
  },
];

function SectionTitle({ ur, en }) {
  return (
    <h2 data-reveal className="text-center text-3xl font-extrabold text-emerald-900">
      <T ur={ur} en={en} />
    </h2>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="overflow-hidden bg-gradient-to-b from-emerald-950 to-emerald-800 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <Badge className="h-auto border-emerald-400/40 bg-emerald-500/20 px-4 py-1 text-sm font-semibold text-emerald-100">
              <T ur="پنجاب بورڈ، جماعت نہم دستیاب ہے" en="Punjab Board Class 9 is available" />
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
              <T ur="میٹرک کے امتحان کی تیاری، اب آسان" en="Matric exam prep, made simple" />
            </h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-100">
              <T
                ur="نویں اور دسویں جماعت کے طلبہ کے لیے: روزانہ کا مطالعہ پلان، باب وار کوئز اور AI ٹیوٹر، اردو اور انگریزی میں۔"
                en="For Class 9 and 10 students: a daily study plan, chapter-wise quizzes and an AI tutor, in Urdu and English."
              />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StoreButton onDark />
              <a href="#features" className="font-semibold text-emerald-100 underline underline-offset-4 hover:text-white">
                <T ur="خصوصیات دیکھیں" en="See the features" />
              </a>
            </div>
            <p className="mt-5 text-sm text-emerald-200">
              <T ur="لانچ کے دوران مفت۔ کوئی اشتہار نہیں۔" en="Free during launch. No ads." />
            </p>
          </div>
          <TiltStage className="hero-stage mx-auto w-64 py-6 md:w-80">
            <div className="hero-tilt relative">
              <Image
                src="/screens/01-today.webp"
                alt={SCREENS[0][1]}
                width={640}
                height={1138}
                priority
                className="float-slow rounded-[2rem] shadow-2xl ring-1 ring-white/20"
              />
              {/* Decorative cards echoing the numbers in the screenshot. */}
              <div aria-hidden="true" className="hero-chip float-a -start-10 top-28 md:-start-16">
                <Flame className="flicker size-5 fill-amber-400 text-amber-500" />
                <span>
                  <b className="count-up" style={{ "--to": 12 }} /> <T ur="دن کا اسٹریک" en="day streak" />
                </span>
              </div>
              <div aria-hidden="true" className="hero-chip float-b -end-8 top-1/2 flex-col items-stretch gap-1.5">
                <span>
                  <b className="count-up" style={{ "--to": 72 }} />% <T ur="تیاری مکمل" en="exam ready" />
                </span>
                <span className="block h-1.5 w-28 overflow-hidden rounded-full bg-emerald-100">
                  <span className="bar-fill block h-full w-[72%] rounded-full bg-emerald-500" />
                </span>
              </div>
              <div aria-hidden="true" className="hero-chip float-c -start-6 bottom-14">
                <Sparkles className="size-5 text-emerald-600" />
                <T ur="AI ٹیوٹر: مرحلہ وار جواب" en="AI tutor: step-by-step answers" />
              </div>
            </div>
          </TiltStage>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle ur="ایپ میں کیا ہے" en="What is in the app" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Card key={f.en[0]} data-reveal style={{ "--delay": `${(i % 3) * 90}ms` }} className="rounded-3xl py-6 shadow-sm">
              <CardHeader className="gap-3 px-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <f.icon className="size-5" />
                </span>
                <CardTitle className="text-lg font-bold text-emerald-900">
                  <h3><T ur={f.ur[0]} en={f.en[0]} /></h3>
                </CardTitle>
                <CardDescription className="text-base">
                  <T ur={f.ur[1]} en={f.en[1]} />
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div dir="ltr" className="marquee mt-12">
          <div className="marquee-track">
            {[...SCREENS, ...SCREENS].map(([name, alt], i) => (
              <Image
                key={i}
                src={`/screens/${name}.webp`}
                alt={i < SCREENS.length ? alt : ""}
                aria-hidden={i >= SCREENS.length}
                width={640}
                height={1138}
                loading="lazy"
                className="w-56 shrink-0 rounded-3xl shadow-md"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-emerald-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle ur="یہ کیسے کام کرتی ہے" en="How it works" />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.en[0]} data-reveal style={{ "--delay": `${i * 120}ms` }}>
                <Card className="h-full rounded-3xl py-6 shadow-sm">
                  <CardHeader className="gap-3 px-6">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <CardTitle className="text-lg font-bold text-emerald-900">
                      <h3><T ur={s.ur[0]} en={s.en[0]} /></h3>
                    </CardTitle>
                    <CardDescription className="text-base">
                      <T ur={s.ur[1]} en={s.en[1]} />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Boards */}
      <section id="boards" className="mx-auto max-w-4xl px-4 py-16">
        <SectionTitle ur="بورڈ اور جماعتیں" en="Boards and classes" />
        <Card data-reveal className="mt-10 rounded-3xl py-2 shadow-sm">
          <CardContent className="px-2">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead><T ur="بورڈ" en="Board" /></TableHead>
                  <TableHead><T ur="جماعت نہم" en="Class 9" /></TableHead>
                  <TableHead><T ur="جماعت دہم" en="Class 10" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BOARDS.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold"><T ur={b.ur} en={b.en} /></TableCell>
                    {["9th", "10th"].map((c) => (
                      <TableCell key={c}>
                        {b.live.includes(c) ? (
                          <Badge className="h-auto px-3 py-0.5 text-sm"><T ur="دستیاب" en="Available" /></Badge>
                        ) : (
                          <Badge variant="outline" className="h-auto px-3 py-0.5 text-sm text-muted-foreground">
                            <T ur="جلد آ رہا ہے" en="Coming soon" />
                          </Badge>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-slate-600">
          <T
            ur="آپ کا بورڈ ابھی دستیاب نہیں؟ ایپ میں اپنا بورڈ چنیں اور کہیں کہ سوالات تیار ہونے پر آپ کو اطلاع دی جائے۔"
            en="Is your board not ready yet? Pick it in the app and ask to be told when its questions are ready."
          />
        </p>
      </section>

      {/* Parents and partners */}
      <section className="bg-emerald-50">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-16 md:grid-cols-2">
          <Card id="parents" data-reveal className="block rounded-3xl p-8 text-base shadow-sm">
            <h2 className="text-2xl font-extrabold text-emerald-900">
              <T ur="والدین کے لیے" en="For parents" />
            </h2>
            <p className="mt-3 text-slate-600">
              <T
                ur="آپ کا بچہ ایپ سے اپنی پیش رفت واٹس ایپ پر آپ کو بھیج سکتا ہے: امتحان کی تیاری، مسلسل پڑھائی کے دن، اور وہ موضوعات جن پر مزید محنت درکار ہے۔"
                en="Your child can send you their progress on WhatsApp from the app: exam readiness, study streak and the topics that need more work."
              />
            </p>
            <p className="mt-3 text-slate-600">
              <T
                ur="ایپ میں اشتہارات نہیں ہیں، اور اکاؤنٹ بنانے کے لیے عمر کم از کم 13 سال ہونی چاہیے۔"
                en="The app has no ads, and students must be at least 13 to create an account."
              />
            </p>
            <Link href="/privacy" className="mt-4 inline-block font-semibold text-emerald-700 underline underline-offset-4">
              <T ur="رازداری کی پالیسی پڑھیں" en="Read the privacy policy" />
            </Link>
          </Card>
          <Card data-reveal style={{ "--delay": "120ms" }} className="block rounded-3xl p-8 text-base shadow-sm">
            <h2 className="text-2xl font-extrabold text-emerald-900">
              <T ur="اساتذہ اور اکیڈمیوں کے لیے" en="For teachers and academies" />
            </h2>
            <p className="mt-3 text-slate-600">
              <T
                ur="اساتذہ، اکیڈمیاں اور کیمپس ایمبیسیڈر اپنا پارٹنر کوڈ لے سکتے ہیں، جو طلبہ ایپ میں سائن اَپ کے وقت درج کرتے ہیں۔"
                en="Teachers, academies and campus ambassadors can get a partner code, which students enter when they sign up in the app."
              />
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Imtihan partner code")}`}
              className="mt-4 inline-block font-semibold text-emerald-700 underline underline-offset-4"
            >
              <T ur="پارٹنر کوڈ کے لیے ای میل کریں" en="Email us for a partner code" />
            </a>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <SectionTitle ur="عام سوالات" en="Common questions" />
        <div className="mt-10 space-y-3">
          <Card data-reveal className="rounded-3xl py-2 shadow-sm">
            <CardContent className="px-6">
              <Accordion>
                {FAQ.map((q) => (
                  <AccordionItem key={q.en[0]} value={q.en[0]}>
                    <AccordionTrigger className="py-4 text-base font-bold">
                      <T ur={q.ur[0]} en={q.en[0]} />
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      <T ur={q.ur[1]} en={q.en[1]} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          <p className="pt-2 text-center text-slate-600">
            <Link href="/delete-account" className="underline underline-offset-4">
              <T ur="اکاؤنٹ حذف کرنے کا طریقہ" en="How to delete your account" />
            </Link>
          </p>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-3xl font-extrabold">
            <T ur="آج ہی تیاری شروع کریں" en="Start preparing today" />
          </h2>
          <div className="mt-6">
            <StoreButton onDark />
          </div>
        </div>
      </section>
    </main>
  );
}
