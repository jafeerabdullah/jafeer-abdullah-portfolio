import { createHash } from 'node:crypto'
import { expect, test } from '@playwright/test'

const expected = [
  [
    'Languages',
    {
      Java: ['java'],
      PHP: ['php'],
      JavaScript: ['javascript'],
      TypeScript: ['typescript'],
      Dart: ['dart'],
      Python: ['python'],
    },
  ],
  [
    'Web & mobile',
    {
      Laravel: ['laravel'],
      Flutter: ['flutter'],
      Firebase: ['firebase'],
      'UI/UX Design': [],
      'Node.js': ['nodejs'],
      'Express.js': [],
      Supabase: ['supabase'],
    },
  ],
  [
    'Data & foundations',
    {
      MySQL: ['mysql'],
      'Database Management': [],
      'Data Structures & Algorithms': [],
      'Networking Fundamentals': [],
    },
  ],
  [
    'Tools & creative',
    {
      'Git & GitHub': ['git', 'github'],
      Jira: ['jira'],
      'Power BI': ['power-bi'],
      'Data Analysis': [],
      Canva: ['canva'],
      'Adobe Photoshop': ['photoshop'],
      'Adobe Illustrator': ['illustrator'],
    },
  ],
] as const

test('live viewport changes never let the animated orbit add horizontal page scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/#skills')
  await expect(page.getByRole('region', { name: 'Skills in Languages', exact: true })).toBeVisible()
  for (const width of [320, 390, 320, 768, 320, 1440, 320]) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `No overflow during resize to ${width}px`,
    ).toBe(true)
  }
})

test('each real skill has its matching original logo or conceptual icon, including center selection', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const remote: string[] = []
  page.on('request', (req) => {
    if (req.url().startsWith('http') && !req.url().startsWith('http://127.0.0.1:4173/'))
      remote.push(req.url())
  })
  await page.goto('/#skills')
  const section = page.locator('#skills')
  for (const [category, skills] of expected) {
    const wheel = section.getByRole('region', { name: `Skills in ${category}`, exact: true })
    await expect(wheel).toBeVisible()
    for (const [name, assets] of Object.entries(skills)) {
      const button = wheel.getByRole('button', { name, exact: true })
      const art = button.locator('.skill-artwork')
      await expect(art).toHaveAttribute('data-skill-icon', name)
      await expect(art).toHaveAttribute('data-icon-kind', assets.length ? 'brand' : 'concept')
      expect(
        await art
          .locator('img')
          .evaluateAll((images) => images.map((image) => image.getAttribute('src'))),
      ).toEqual(assets.map((asset) => `/icons/skills/${asset}.svg`))
      if (!assets.length) await expect(art.locator('svg')).toHaveCount(1)
      for (const image of await art.locator('img').all()) {
        await image.scrollIntoViewIfNeeded()
        await image.evaluate((image: HTMLImageElement) => image.decode())
        await expect(image).toHaveCSS('object-fit', 'contain')
        await expect(image).toHaveCSS('filter', 'none')
      }
      await button.click()
      const hub = wheel.locator('.skill-orbit-hub')
      await expect(hub).toBeVisible()
      await expect(hub).toHaveAttribute('data-selected-skill', name)
      await expect(hub.locator('.skill-selected-name')).toHaveText(name)
      await expect(hub.locator('.skill-artwork')).toHaveAttribute('data-skill-icon', name)
      await expect(wheel.locator('.skill-selection-flight')).toHaveCount(0)
    }
    await section.getByRole('button', { name: 'Next category', exact: true }).click()
  }
  const manifest = await request
    .get('/icons/skills/sources.json')
    .then((response) => response.json())
  expect(manifest).toHaveLength(19)
  for (const asset of manifest) {
    const response = await request.get(`/icons/skills/${asset.name}.svg`)
    expect(response.ok()).toBe(true)
    expect(
      createHash('sha256')
        .update(await response.body())
        .digest('hex'),
    ).toBe(asset.sha256)
  }
  expect(remote).toEqual([])
})

test('logos fly to the glossy center, tooltip names work, and repeated or interrupted selections settle correctly', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#skills')
  const section = page.locator('#skills')
  await section.getByRole('button', { name: 'Next category', exact: true }).click()
  const wheel = section.getByRole('region', { name: 'Skills in Web & mobile', exact: true })
  await expect(wheel).toBeVisible()
  const flutter = wheel.getByRole('button', { name: 'Flutter', exact: true })
  await flutter.hover()
  await expect(flutter.locator('..').locator('.skill-orbit-tooltip')).toHaveCSS(
    'visibility',
    'visible',
  )
  await flutter.click()
  const flight = wheel.locator('.skill-selection-flight')
  await expect(flight).toHaveCount(1)
  await expect(flight.locator('.skill-artwork')).toHaveAttribute('data-skill-icon', 'Flutter')
  await expect(flight).toHaveCount(0)
  const hub = wheel.locator('.skill-orbit-hub')
  await expect(hub.locator('.skill-hub-artwork')).toHaveCSS('opacity', '1')
  await expect(hub).toHaveAttribute('data-selected-skill', 'Flutter')
  await expect(hub.locator('.skill-selected-name')).toHaveText('Flutter')
  const status = section.getByRole('status')
  await flutter.click()
  await expect(flight).toHaveCount(0)
  await expect(status).toContainText('Flutter, 2 of 7')
  await wheel.getByRole('button', { name: 'Firebase', exact: true }).click()
  await wheel.evaluate((wheel) =>
    (wheel.querySelector('button[aria-label="UI/UX Design"]') as HTMLButtonElement).click(),
  )
  await expect(status).toContainText('UI/UX Design, 4 of 7')
  await expect(flight).toHaveCount(0)
  await expect(hub).toHaveAttribute('data-selected-skill', 'UI/UX Design')
  await expect(hub.locator('.skill-artwork')).toHaveAttribute('data-icon-kind', 'concept')
  await expect(hub.locator('.skill-selected-name')).toHaveText('UI/UX Design')
  await expect(section.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('the center logo and full names fit on desktop, tablet and mobile without colliding with orbit icons', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#skills')
  const section = page.locator('#skills')
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await section.getByRole('region', { name: 'Skill categories', exact: true }).focus()
    await page.keyboard.press('Home')
    for (const [category, skills] of expected) {
      const wheel = section.getByRole('region', { name: `Skills in ${category}`, exact: true })
      await expect(wheel).toBeVisible()
      for (const name of Object.keys(skills)) {
        await wheel.getByRole('button', { name, exact: true }).click()
        await expect
          .poll(
            async () =>
              wheel.evaluate((wheel) => {
                const hub = wheel.querySelector<HTMLElement>('.skill-orbit-hub')!
                const box = hub.getBoundingClientRect()
                const name = hub.querySelector<HTMLElement>('.skill-selected-name')!
                const text = name.getBoundingClientRect()
                return (
                  getComputedStyle(hub).display !== 'none' &&
                  text.left >= box.left &&
                  text.right <= box.right &&
                  text.bottom <= box.bottom &&
                  name.scrollHeight <= name.clientHeight + 1 &&
                  [...wheel.querySelectorAll<HTMLElement>('.skill-orbit-tag')].every((tag) => {
                    const rect = tag.getBoundingClientRect()
                    return (
                      Math.min(rect.right, box.right) - Math.max(rect.left, box.left) < 1 ||
                      Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top) < 1
                    )
                  })
                )
              }),
            { message: `Readable ${name} and a clear center at ${width}px` },
          )
          .toBe(true)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
      }
      await section.getByRole('button', { name: 'Next category', exact: true }).click()
    }
  }
})
