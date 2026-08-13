/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Crucial for lightweight Docker deployments
};

export default nextConfig;
