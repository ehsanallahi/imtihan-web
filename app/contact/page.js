import { Notice } from "@/components/site-chrome";
import { bigButton } from "@/components/store-button";
import { T } from "@/components/t";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <Notice title={<T ur="ہم سے رابطہ کریں" en="Contact us" />}>
      <p>
        <T
          ur="مدد، تجاویز، کسی سوال میں غلطی کی اطلاع، یا پارٹنر کوڈ کے لیے ہمیں ای میل کریں۔"
          en="Email us for help, suggestions, to report a mistake in a question, or for a partner code."
        />
      </p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        dir="ltr"
        className={cn(buttonVariants(), bigButton)}
      >
        {SUPPORT_EMAIL}
      </a>
    </Notice>
  );
}
