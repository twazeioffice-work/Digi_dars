import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Crucial for lightweight Docker deployments
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
