/** @type {import('next').NextConfig} */
import nextIntl from "next-intl/plugin";
const withNextIntl = nextIntl();

const nextConfig = {
  // reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "avataaars.io",
      "lottie.host",
    ],
  },
  webpack: (config, options) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "/_next/static/sounds/",
          outputPath: "static/sounds/",
        },
      },
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
