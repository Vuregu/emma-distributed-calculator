/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'CDN-Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
