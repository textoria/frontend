const API_BASE_URL = process.env.API_BASE_URL || 'http://back:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async rewrites() {
        return [
            {
                source: "/api/update",
                destination: `${API_BASE_URL}/update_key`
            }
        ];
    },
    publicRuntimeConfig: {
        API_BASE_URL,
    },
};

module.exports = nextConfig;