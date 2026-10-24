import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

// Node-only build step: no browser, runtime server, or additional dependency required.
const outDir = '.local/prerender'
const result = await build({
  configFile: 'vite.config.ts',
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx', outDir, emptyOutDir: true, copyPublicDir: false, minify: false,
    rollupOptions: { output: { manualChunks: undefined } },
  },
})
if (Array.isArray(result) || !('output' in result)) throw new Error('Expected one SSR build.')
const entry = result.output.find((chunk) => chunk.type === 'chunk' && chunk.isEntry)
if (!entry) throw new Error('Missing prerender entry.')
const { render } = await import(pathToFileURL(path.resolve(outDir, entry.fileName)).href)
const { app, fallback } = render()
const template = await readFile('dist/index.html', 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('Missing root marker; refusing an empty production page.')

// React 19 emits a duplicate hero preload at the beginning of server markup.
// The explicit high-priority preload already exists in the document head.
const content = app.replace(/^<link rel="preload" as="image"[^>]+\/>/, '')
const assets = await readdir('dist/assets')
const fonts = ['bebas-neue-latin-400-normal-', 'dm-sans-latin-400-normal-'].map((prefix) => {
  const name = assets.find((asset) => asset.startsWith(prefix) && asset.endsWith('.woff2'))
  if (!name) throw new Error(`Missing critical font: ${prefix}`)
  return `<link rel="preload" as="font" href="/assets/${name}" type="font/woff2" crossorigin>`
}).join('\n')
const noscript = `<noscript><style>#root{display:none!important}.static-portfolio{max-width:960px;margin:auto;padding:40px 24px;color:#eee9df;background:#0f0f0f;font:18px/1.7 "DM Sans",sans-serif}.static-portfolio a{color:#c6a775}.static-portfolio section{margin-top:48px}.static-portfolio article{margin:32px 0}.static-portfolio h1{font-size:clamp(30px,6vw,52px);line-height:1.2}.static-portfolio h2{font-size:30px}.static-portfolio h3{font-size:22px;line-height:1.4}</style>${fallback}</noscript>`
await writeFile('dist/index.html', template
  .replace('</head>', `${fonts}\n</head>`)
  .replace(marker, `<div id="root" data-prerendered="true">${content}</div>${noscript}`))
console.log('Prerendered the existing portfolio and its JavaScript-disabled document.')
