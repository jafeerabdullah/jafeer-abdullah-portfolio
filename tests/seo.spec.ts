import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { certifications, profile, projects, skillGroups } from '../src/data/portfolio'
import { portraitImages, seo } from '../src/data/seo'

test('initial HTML includes real content and unique production metadata', async ({ page, request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  expect(response.headers()['x-robots-tag'] || '').not.toContain('noindex')
  const source = await response.text()
  expect(source).toContain('data-prerendered="true"')
  expect(source).toContain('Bachelor of Applied IT')
  for (const project of projects) expect(source.includes(project.shortTitle.replaceAll('&', '&amp;')), project.shortTitle).toBe(true)
  await page.goto('/')
  await expect(page).toHaveTitle(seo.title)
  await expect(page.locator('head title')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', seo.url)
  for (const [key, value] of Object.entries({ description: seo.description, robots: 'index, follow, max-image-preview:large', 'twitter:card': 'summary_large_image', 'twitter:image': seo.image })) {
    await expect(page.locator(`meta[name="${key}"]`)).toHaveCount(1)
    await expect(page.locator(`meta[name="${key}"]`)).toHaveAttribute('content', value)
  }
  for (const [key, value] of Object.entries({ 'og:url': seo.url, 'og:title': seo.title, 'og:image': seo.image })) {
    await expect(page.locator(`meta[property="${key}"]`)).toHaveCount(1)
    await expect(page.locator(`meta[property="${key}"]`)).toHaveAttribute('content', value)
  }
  await expect(page.locator('#root h1')).toHaveCount(1)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText())
  expect(schema['@context']).toBe('https://schema.org')
  const person = schema['@graph'].find((entry: { '@type': string }) => entry['@type'] === 'Person')
  expect(person.name).toBe(profile.name)
  expect(person.sameAs).toEqual([profile.github, profile.linkedin])
  expect(person.knowsAbout).toEqual(skillGroups.flatMap((group) => [...group.items]))
  expect(schema['@graph'].some((entry: { '@type': string }) => entry['@type'] === 'WebSite')).toBe(true)
})

test('robots, the one-page sitemap, image metadata, and internal links resolve', async ({ page, request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`Sitemap: ${seo.url}sitemap.xml`)
  expect(await robots.text()).not.toMatch(/Disallow:\s*\//)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  await page.goto('/')
  const xml = await sitemap.text()
  const locations = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, 'application/xml')
    if (document.querySelector('parsererror')) throw new Error('Invalid sitemap XML')
    return [...document.getElementsByTagNameNS('http://www.sitemaps.org/schemas/sitemap/0.9', 'loc')].map((node) => node.textContent)
  }, xml)
  expect(locations).toEqual([seo.url])
  const imageLocations = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, 'application/xml')
    return [...document.getElementsByTagNameNS('http://www.google.com/schemas/sitemap-image/1.1', 'loc')].map((node) => node.textContent)
  }, xml)
  expect(imageLocations).toEqual(portraitImages.map((image) => new URL(image.path, seo.url).href))
  for (const image of portraitImages) {
    const imageResponse = await request.get(image.path)
    expect(imageResponse.status()).toBe(200)
    expect(imageResponse.headers()['content-type']).toContain(image.encodingFormat)
    expect(imageResponse.headers()['x-robots-tag'] || '').not.toContain('noindex')
  }
  expect(await page.locator('img:not([alt])').count()).toBe(0)
  const missingAnchors = await page.locator('a[href^="#"]').evaluateAll((links) => links
    .map((link) => link.getAttribute('href')!)
    .filter((href) => href.length > 1 && !document.getElementById(href.slice(1))))
  expect(missingAnchors).toEqual([])
  const paths = await page.locator('a[href^="/"], link[rel="preload"], link[rel="icon"]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')!))])
  paths.push(new URL(seo.image).pathname)
  for (const path of paths) expect((await request.get(path)).status(), path).toBe(200)
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2)
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1)
})

test('profile and both portraits are linked in the initial structured data', async ({ request }) => {
  const source = await (await request.get('/')).text()
  const match = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  expect(match).not.toBeNull()
  const graph = JSON.parse(match![1])['@graph']
  const profilePage = graph.find((entry: { '@type': string }) => entry['@type'] === 'ProfilePage')
  const person = graph.find((entry: { '@type': string }) => entry['@type'] === 'Person')
  const images = graph.filter((entry: { '@type': string }) => entry['@type'] === 'ImageObject')
  expect(profilePage.mainEntity['@id']).toBe(person['@id'])
  expect(profilePage.url).toBe(seo.url)
  expect(images).toHaveLength(2)
  expect(person.image.map((image: { '@id': string }) => image['@id'])).toEqual(images.map((image: { '@id': string }) => image['@id']))
  expect(profilePage.primaryImageOfPage['@id']).toBe(images[0]['@id'])
  for (const [index, image] of images.entries()) {
    expect(image.contentUrl).toBe(new URL(portraitImages[index].path, seo.url).href)
    expect(image.caption).toContain(profile.name)
    expect(image.about['@id']).toBe(person['@id'])
    expect(image.width).toBe(portraitImages[index].width)
    expect(image.height).toBe(portraitImages[index].height)
  }
})

test('the updated resume is served byte for byte and About uses the full name', async ({ page, request }) => {
  const expected = readFileSync(new URL('../public/documents/Jafeer-Abdullah-CV.pdf', import.meta.url))
  const response = await request.get(profile.resume)
  expect(response.status()).toBe(200)
  const hash = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')
  expect(hash(await response.body())).toBe(hash(expected))
  await page.goto('/#about')
  await expect(page.locator('#about .lead')).toContainText('I’m Jafeer Abdullah, a software developer')
})

test('visitors without JavaScript can browse real work and documents on mobile', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    await page.goto(baseURL!)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    for (const image of portraitImages) {
      await expect(page.locator(`.static-portfolio img[src="${image.path}"]`)).toBeVisible()
    }
    await expect(page.getByRole('link', { name: 'Download résumé' })).toBeVisible()
    for (const project of projects) await expect(page.getByRole('link', { name: `View ${project.shortTitle} source on GitHub`, exact: true })).toBeVisible()
    for (const certificate of certifications) await expect(page.getByRole('link', { name: `View ${certificate.title} document`, exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await context.close() }
})

for (const preference of ['no-preference', 'reduce'] as const) {
  test(`prerender hydrates without errors with ${preference} motion`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await page.emulateMedia({ reducedMotion: preference })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.locator('#skills').scrollIntoViewIfNeeded()
    const stage = page.locator('.skills-carousel')
    await expect(stage).toHaveAttribute('data-atmosphere-active', preference === 'reduce' ? 'false' : 'true')
    await page.emulateMedia({ reducedMotion: preference === 'reduce' ? 'no-preference' : 'reduce' })
    await expect(stage).toHaveAttribute('data-atmosphere-active', preference === 'reduce' ? 'true' : 'false')
    expect(errors).toEqual([])
  })
}
