// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects () {
    return [
      {
        source: '/events/:identifier',
        destination: '/:identifier',
        permanent: true
      },
      { source: '/event/:id', destination: '/:id', permanent: true }
    ]
  }
}

export default nextConfig
