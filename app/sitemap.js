import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap() {
  return ["", "/testers", "/privacy", "/terms", "/delete-account", "/contact"].map((path) => ({ url: `${SITE_URL}${path}` }));
}
