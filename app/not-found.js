import Link from "next/link";

import { Notice } from "@/components/site-chrome";
import { bigButton } from "@/components/store-button";
import { T } from "@/components/t";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Notice title={<T ur="یہ صفحہ نہیں ملا" en="Page not found" />}>
      <p>
        <T ur="جو صفحہ آپ ڈھونڈ رہے ہیں وہ موجود نہیں۔" en="The page you are looking for does not exist." />
      </p>
      <Link href="/" className={cn(buttonVariants(), bigButton)}>
        <T ur="ہوم پیج پر جائیں" en="Go to the home page" />
      </Link>
    </Notice>
  );
}
