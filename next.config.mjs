/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 重写规则 - 支持多个静态 SPA 应用
  async rewrites() {
    return {
      beforeFiles: [
        // IT-Tools: /tools 和 /tools/ 指向 index.html
        {
          source: '/tools',
          destination: '/tools/index.html',
        },
        {
          source: '/tools/',
          destination: '/tools/index.html',
        },
        // Squoosh: /squoosh 和 /squoosh/ 指向 index.html
        {
          source: '/squoosh',
          destination: '/squoosh/index.html',
        },
        {
          source: '/squoosh/',
          destination: '/squoosh/index.html',
        },
        // Excalidraw: /draw 和 /draw/ 指向 index.html
        {
          source: '/draw',
          destination: '/draw/index.html',
        },
        {
          source: '/draw/',
          destination: '/draw/index.html',
        },
      ],
      afterFiles: [
        // IT-Tools 子路由
        {
          source: '/tools/:path((?!.*\\.).*)',
          destination: '/tools/index.html',
        },
        // Squoosh 子路由
        {
          source: '/squoosh/:path((?!.*\\.).*)',
          destination: '/squoosh/index.html',
        },
        // Excalidraw 子路由
        {
          source: '/draw/:path((?!.*\\.).*)',
          destination: '/draw/index.html',
        },
      ],
    };
  },
};

export default nextConfig;
