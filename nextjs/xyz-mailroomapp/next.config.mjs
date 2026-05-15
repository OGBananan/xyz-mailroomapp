/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    // Explicitly wire the backend URL so it's always baked into the static bundle.
    // .env.production sets NEXT_PUBLIC_API_URL; fall back to local dev.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:4000",
  },
}

export default nextConfig
