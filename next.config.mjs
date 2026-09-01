/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Clinical images are served by acne-api behind a signed, short-lived token (RNF-02). They are
  // NOT run through next/image: the optimiser would cache decrypted frames on disk outside the
  // audited path, which is exactly what the encryption-at-rest requirement forbids.
  images: { unoptimized: true },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Patient photographs must never leak into a referrer or a third-party frame.
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
