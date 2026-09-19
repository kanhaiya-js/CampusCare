if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
};

export default nextConfig;
