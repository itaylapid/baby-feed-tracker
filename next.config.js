/** @type {import('next').NextConfig} */
const nextConfig = {
  // The original app is a single-run vanilla-JS script that wires up its own
  // event listeners/intervals once on load. React StrictMode double-invokes
  // effects in dev, which would double-register everything, so it's off here.
  reactStrictMode: false,
};

module.exports = nextConfig;
