import Link from "next/link";

import { Notice } from "@/components/site-chrome";
import { T } from "@/components/t";

export const metadata = { title: "Plans", robots: { index: false } };

// The app's "ask a parent" WhatsApp message links here (/upgrade?student=…).
// Nothing is for sale during the free launch, so this only says so.
export default function Upgrade() {
  return (
    <Notice title={<T ur="امتحان ابھی مفت ہے" en="Imtihan is free right now" />}>
      <p>
        <T
          ur="لانچ کے دوران ایپ مفت ہے، اس لیے آپ کو کوئی ادائیگی نہیں کرنی۔ بامعاوضہ پلان ابھی فروخت کے لیے دستیاب نہیں۔"
          en="The app is free during launch, so there is nothing to pay. Paid plans are not on sale yet."
        />
      </p>
      <p>
        <T
          ur="اگر کوئی آپ سے امتحان ایپ کے نام پر رقم مانگے تو ادائیگی نہ کریں اور ہمیں بتائیں۔"
          en="If anyone asks you for money in Imtihan's name, do not pay, and tell us."
        />
      </p>
      <Link href="/contact" className="inline-block font-semibold text-emerald-700 underline underline-offset-4">
        <T ur="ہم سے رابطہ کریں" en="Contact us" />
      </Link>
    </Notice>
  );
}
