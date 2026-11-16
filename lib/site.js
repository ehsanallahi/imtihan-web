// Facts the whole site reads. Change them here, not in the pages.

export const SITE_URL = "https://imtihan.app";
export const SUPPORT_EMAIL = "support.imtihan@gmail.com";
export const COMPANY = "Ravi Stack";

// Android package name, from android/app/build.gradle in the app repo.
export const ANDROID_PACKAGE = "app.imtihan";

// The app is in closed testing, so there is no public listing yet and the buttons
// invite people to /testers. When it is public, set this to true: every button
// becomes a Play Store link and /download starts redirecting.
export const APP_IS_PUBLIC = false;

// Closed test (see /testers): joining the group makes an account eligible, the
// opt-in link turns testing on for it.
export const TESTERS_GROUP_URL = "https://groups.google.com/g/imtihan-app";
export const TESTERS_OPT_IN_URL = `https://play.google.com/apps/testing/${ANDROID_PACKAGE}`;

/** Play Store link. `referrer` (e.g. "partner=KIPS-LHR") reaches the app's install referrer. */
export function playStoreUrl(referrer) {
  const url = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  return referrer ? `${url}&referrer=${encodeURIComponent(referrer)}` : url;
}

// Boards the app lists, and the classes with published questions. Keep in step
// with kPublishedContent in the app (features/curriculum/domain/content_availability.dart).
export const BOARDS = [
  { id: "punjab", en: "Punjab Board", ur: "پنجاب بورڈ", live: ["9th"] },
  { id: "federal", en: "Federal Board", ur: "فیڈرل بورڈ", live: [] },
  { id: "sindh", en: "Sindh Board", ur: "سندھ بورڈ", live: [] },
  { id: "kpk", en: "KPK Board", ur: "خیبر پختونخوا بورڈ", live: [] },
  { id: "balochistan", en: "Balochistan Board", ur: "بلوچستان بورڈ", live: [] },
  { id: "ajk", en: "AJK Board", ur: "آزاد کشمیر بورڈ", live: [] },
];
