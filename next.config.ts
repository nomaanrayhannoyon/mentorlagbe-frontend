import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * Security + CORS headers.
   *
   * The frontend and backend are the same Next app in this deployment, so
   * cross-origin requests are not required. The `Access-Control-Allow-Origin`
   * header is still set from an allowlist env var (`CORS_ALLOWED_ORIGIN`) so
   * a separately hosted frontend can be enabled without a code change. When
   * the var is unset, only same-origin requests are allowed.
   */
  async headers() {
    const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN ?? ""
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Apply CORS only to the API surface.
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          ...(allowedOrigin
            ? [
                {
                  key: "Access-Control-Allow-Origin",
                  value: allowedOrigin,
                },
                {
                  key: "Access-Control-Allow-Credentials",
                  value: "true",
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
