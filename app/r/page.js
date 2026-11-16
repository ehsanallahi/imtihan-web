"use client";

import { useEffect, useState } from "react";

import { Notice } from "@/components/site-chrome";
import { StoreButton } from "@/components/store-button";
import { T } from "@/components/t";

// A partner's invite link: imtihan.app/r/KIPS-LHR (vercel.json serves this
// page for every /r/… address). Shows the code the student types on the last onboarding step.
export default function PartnerInvite() {
  // undefined until the URL has been read in the browser; "" if it has no usable code.
  const [code, setCode] = useState();

  useEffect(() => {
    const raw = window.location.pathname.split("/")[2] || "";
    const clean = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL only exists in the browser
    setCode(clean);
  }, []);

  return (
    <Notice title={<T ur="آپ کو امتحان ایپ کی دعوت ملی ہے" en="You are invited to Imtihan" />}>
      {code ? (
        <>
          <p>
            <T
              ur="ایپ انسٹال کریں اور سائن اَپ کے آخری مرحلے پر یہ کوڈ درج کریں:"
              en="Install the app and enter this code on the last step of sign-up:"
            />
          </p>
          <p dir="ltr" className="rounded-2xl bg-emerald-50 py-4 font-mono text-3xl font-bold tracking-widest text-emerald-900">
            {code}
          </p>
        </>
      ) : code === "" ? (
        <p>
          <T
            ur="اس لنک میں کوڈ موجود نہیں۔ اپنے استاد یا اکیڈمی سے کوڈ دوبارہ مانگیں۔"
            en="This link has no code in it. Ask your teacher or academy for the code again."
          />
        </p>
      ) : null}
      <StoreButton referrer={code ? `partner=${code}` : undefined} />
    </Notice>
  );
}
