import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-production-metadata',
      transformIndexHtml(html) {
        // Vercel supplies a public production hostname, including on preview builds.
        const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
        if (!host) return html
        const origin = new URL(`https://${host}`).origin
        return {
          html: html.replaceAll('/images/social-cover.jpg', `${origin}/images/social-cover.jpg`),
          tags: [
            { tag: 'link', attrs: { rel: 'canonical', href: origin }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:url', content: origin }, injectTo: 'head' },
          ],
        }
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
})
