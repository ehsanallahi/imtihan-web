"use client";

import { useEffect } from "react";

import { Notice } from "@/components/site-chrome";
import { StoreButton } from "@/components/store-button";
import { T } from "@/components/t";
import { APP_IS_PUBLIC, playStoreUrl } from "@/lib/site";

// The link for posters, QR codes and WhatsApp: imtihan.app/download?utm_source=poster.
// Once the app is public it goes straight to the Play Store, passing the query
// string on as the install referrer so campaigns can be told apart.
export default function Download() {
  useEffect(() => {
    if (APP_IS_PUBLIC) window.location.replace(playStoreUrl(window.location.search.slice(1)));
  }, []);

  return (
    <Notice title={<T ur="امتحان ایپ ڈاؤن لوڈ کریں" en="Download Imtihan" />}>
      <p>
        {APP_IS_PUBLIC ? (
          <T ur="آپ کو Google Play پر لے جایا جا رہا ہے۔" en="Taking you to Google Play." />
        ) : (
          <T
            ur="ایپ ابھی آزمائش کے مرحلے میں ہے اور جلد Google Play پر سب کے لیے دستیاب ہوگی۔ تب تک آپ اسے ابتدائی ٹیسٹر بن کر آزما سکتے ہیں۔"
            en="The app is being tested and will be on Google Play for everyone soon. Until then you can try it as an early tester."
          />
        )}
      </p>
      <StoreButton />
    </Notice>
  );
}
