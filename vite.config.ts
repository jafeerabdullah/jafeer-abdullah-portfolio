import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { seo, structuredData } from './src/data/seo'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-seo',
      transformIndexHtml() {
        const robots = command === 'serve' || process.env.VERCEL_ENV === 'preview'
          ? 'noindex, follow'
          : 'index, follow, max-image-preview:large'
        const meta = (key: string, content: string, property = false) => ({
          tag: 'meta', attrs: { [property ? 'property' : 'name']: key, content },
        })
        return [
          { tag: 'title', children: seo.title },
          meta('description', seo.description),
          meta('robots', robots),
          { tag: 'link', attrs: { rel: 'canonical', href: seo.url } },
          meta('og:title', seo.title, true),
          meta('og:description', seo.description, true),
          meta('og:type', 'website', true),
          meta('og:url', seo.url, true),
          meta('og:site_name', 'Jafeer Abdullah — Developer Portfolio', true),
          meta('og:locale', 'en_US', true),
          meta('og:image', seo.image, true),
          meta('og:image:type', 'image/jpeg', true),
          meta('og:image:width', '1440', true),
          meta('og:image:height', '756', true),
          meta('og:image:alt', seo.imageAlt, true),
          meta('twitter:card', 'summary_large_image'),
          meta('twitter:title', seo.title),
          meta('twitter:description', seo.description),
          meta('twitter:image', seo.image),
          meta('twitter:image:alt', seo.imageAlt),
          {
            tag: 'script', attrs: { type: 'application/ld+json' },
            children: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
          },
          ...(process.env.GOOGLE_SITE_VERIFICATION
            ? [meta('google-site-verification', process.env.GOOGLE_SITE_VERIFICATION)] : []),
        ].map((tag) => ({ ...tag, injectTo: 'head' as const }))
      },
    },
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor'
          if (id.includes('/three/') || id.includes('@react-three')) return 'three-scene'
          if (id.includes('/motion') || id.includes('/framer-motion')) return 'motion'
        },
      },
    },
  },
}))
