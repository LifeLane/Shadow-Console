import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // This is a workaround for a build issue with protobuf.js, a dependency
    // of one of the Genkit packages. It's related to a dynamic require
    // that Webpack can't resolve. We can safely ignore this by telling
    // Webpack to not parse the file, which prevents it from looking for
    // the missing module.
    config.module.noParse = /protobufjs/;
    return config;
  },
};

export default nextConfig;
