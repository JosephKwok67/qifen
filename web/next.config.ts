import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  // Deployed to Vercel, so we keep server rendering for /api/analyze.
  images: { unoptimized: true },
}
export default nextConfig
