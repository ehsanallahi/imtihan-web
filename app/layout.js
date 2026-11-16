import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";

import { ScrollReveals } from "@/components/motion";
import { Footer, Header } from "@/components/site-chrome";
import { langScript } from "@/components/t";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const latin = Inter({ variable: "--font-latin", subsets: ["latin"] });
const urdu = Noto_Nastaliq_Urdu({ variable: "--font-urdu", subsets: ["arabic"] });

const description =
  "Imtihan is an exam prep app for Matric (Class 9 and 10) students in Pakistan: a daily study plan, chapter-wise quizzes, mock exams and an AI tutor, in Urdu and English.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Imtihan (امتحان) — Matric exam prep for Class 9 and 10",
    template: "%s — Imtihan",
  },
  description,
  openGraph: {
    title: "Imtihan (امتحان) — Matric exam prep",
    description,
    url: SITE_URL,
    siteName: "Imtihan",
    images: [{ url: "/og.png", width: 1024, height: 500 }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    // English first, like the app. langScript switches to Urdu before paint if the visitor chose it,
    // which changes these attributes, hence suppressHydrationWarning.
    <html
      lang="en"
      dir="ltr"
      data-lang="en"
      suppressHydrationWarning
      className={`${latin.variable} ${urdu.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        {children}
        <Footer />
        <ScrollReveals />
      </body>
    </html>
  );
}
