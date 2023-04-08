/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async rewrites() {
        return [
            {
                source: "/api/update",
                destination: "http://back:8000/update_key"
            }
        ];
    }
};
module.exports = nextConfig;