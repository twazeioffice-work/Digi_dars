import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Crucial for lightweight Docker deployments
  async rewrites() {
    const raw = process.env.BACKEND_API_URL || 'http://172.17.0.1:8001';
    const backendBase = raw.split('/api')[0].replace(/\/+$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBase}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
};

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "dars-crm",
    project: "dars-crm-frontend",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
