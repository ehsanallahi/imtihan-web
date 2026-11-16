import { Notice } from "@/components/site-chrome";
import { StoreButton } from "@/components/store-button";
import { T } from "@/components/t";

export const metadata = { title: "Parent report", robots: { index: false } };

// Where the app's parent links land (imtihan.app/p/<code>; vercel.json serves
// this page for every /p/… address). The report itself can't be shown yet: the app's firestore.rules closes
// parent_portals to every client until a server function serves it. When that
// exists, read the code from the address here and show the report.
export default function ParentReport() {
  return (
    <Notice title={<T ur="والدین کی رپورٹ جلد آ رہی ہے" en="Parent reports are coming soon" />}>
      <p>
        <T
          ur="ویب پر والدین کی رپورٹ ابھی دستیاب نہیں۔ ہم اس پر کام کر رہے ہیں۔"
          en="The parent report is not available on the web yet. We are working on it."
        />
      </p>
      <p>
        <T
          ur="تب تک اپنے بچے سے کہیں کہ وہ ایپ کے Me ٹیب سے اپنی ہفتہ وار پیش رفت رپورٹ واٹس ایپ پر آپ کو بھیجے۔"
          en="Until then, ask your child to send you their weekly progress report on WhatsApp from the Me tab in the app."
        />
      </p>
      <StoreButton />
    </Notice>
  );
}
