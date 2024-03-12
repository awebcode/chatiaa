/** @type {import('next').NextConfig} */
import nextIntl from "next-intl/plugin";
const withNextIntl = nextIntl();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "avataaars.io",
    ],
  },
};

export default withNextIntl(nextConfig);
