/** @type {import('next').NextConfig} */
const nextConfig = {
  // Plain HTML/CSS/JS in `out/`, served by Vercel. Routing for /p/… and /r/… is in vercel.json.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
