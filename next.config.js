const API_BASE_URL = process.env.API_BASE_URL || 'http://back:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async rewrites() {
        return [
            {
                source: "/api/update_key",
                destination: `${API_BASE_URL}/update_key`
            },
            {
                source: "/api/create_key",
                destination: `${API_BASE_URL}/create_key`
            },
            {
                source: "/api/delete_key",
                destination: `${API_BASE_URL}/delete_key`
            },
            {
                source: "/api/get_all_keys",
                destination: `${API_BASE_URL}/get_all_keys`
            }
        ];
    },
    publicRuntimeConfig: {
        API_BASE_URL
    }
};

module.exports = nextConfig;

