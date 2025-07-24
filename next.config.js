// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // only include this if you're using /app folder
  },
  // You can add more options here if needed
};

module.exports = nextConfig;
