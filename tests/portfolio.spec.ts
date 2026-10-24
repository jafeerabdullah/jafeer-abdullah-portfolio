import { expect, test } from '@playwright/test'

test('real identity, optimized assets, resume, and original repository links work', async ({
  page,
  request,
}) => {
  const failures: string[] = []
  const sceneRequests: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('request', (request) => {
    if (request.url().includes('three-scene')) sceneRequests.push(request.url())
  })
  await page.goto('/')
  expect(sceneRequests).toEqual([])
  await expect(page).toHaveTitle('Jafeer Abdullah — Full Stack Software Developer')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('JAFEER ABDULLAH')
  await expect(page.getByAltText('Jafeer Abdullah wearing a suit')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Download résumé' }).click()
  expect((await download).suggestedFilename()).toBe('Jafeer-Abdullah-CV.pdf')
  const response = await request.get('/documents/Jafeer-Abdullah-CV.pdf')
  expect(response.status()).toBe(200)
  expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF')
  // Stop the intentional continuous orbit before checking each image's stable bounds.
  await page.getByRole('button', { name: 'Pause automatic rotation' }).click()
  await page.mouse.move(0, 0)
  for (const image of await page.locator('.app-shell img:not(.certificate-sheet > img)').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate(
          (node) =>
            (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true)
  }
  // Hidden coverflow slides stay lazy until the visitor browses to them.
  const gallery = page.getByRole('region', { name: 'Certificate gallery', exact: true })
  await gallery.scrollIntoViewIfNeeded()
  await gallery.focus()
  await page.keyboard.press('Home')
  for (let index = 0; index < 7; index++) {
    await page
      .locator('.certificate-card[data-active="true"] img')
      .evaluate((image: HTMLImageElement) => image.decode())
    await page.keyboard.press('ArrowRight')
  }
  await page.locator('#education').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  const images = await page
    .locator('.app-shell img')
    .evaluateAll((nodes) =>
      nodes.map((n) => ({ src: n.getAttribute('src'), loaded: n.complete && n.naturalWidth > 0 })),
    )
  expect(images.filter((image) => !image.loaded)).toEqual([])
  expect(failures).toEqual([])
})

test('filters preserve the genuine project categories', async ({ page }) => {
  await page.goto('/')
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('.project-card')).toHaveCount(7)
  await page.getByRole('button', { name: 'Mobile 01', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await expect(page.locator('.project-card')).toContainText('Abu Fashion Store')
  await page.getByRole('button', { name: 'Java 03', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(3)
  await page.getByRole('button', { name: 'Web 03', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(3)
  await page.getByRole('button', { name: 'All work 07', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(7)
})

test('shared project detail view traps focus, links to source, and closes with Escape', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Show project 02: Campus Store ERP', exact: true }).click()
  const opener = page.getByRole('button', { name: 'Explore Campus Store ERP', exact: true })
  await opener.scrollIntoViewIfNeeded()
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(
    'Campus Store Management ERP System',
  )
  await expect(dialog.getByRole('link', { name: 'Explore the repository' })).toHaveAttribute(
    'href',
    'https://github.com/jafeerabdullah/campus-store-erp',
  )
  await expect(page.locator('.app-shell')).toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('link', { name: 'Explore the repository' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused()
  await page.waitForTimeout(800)
  await page.screenshot({ path: '.local/project-detail-desktop.png' })
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.app-shell')).not.toHaveAttribute('inert', '')
  await expect(opener).toBeFocused()
})

test('form validates every required field and prepares an honest email draft', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Prepare email' }).click()
  await expect(page.locator('[aria-invalid=true]')).toHaveCount(4)
  await expect(page.getByLabel('Your name')).toBeFocused()
  await page.getByLabel('Your name').fill('Portfolio reviewer')
  await page.locator('#contact-email').fill('invalid-email')
  await page.locator('#contact-subject').fill('Internship opportunity')
  await page
    .getByLabel('Your message')
    .fill('I would like to discuss a software development internship.')
  await page.getByRole('button', { name: 'Prepare email' }).click()
  await expect(page.locator('[aria-invalid=true]')).toHaveCount(1)
  await page.locator('#contact-email').fill('reviewer@example.com')
  await page.getByRole('button', { name: 'Prepare email' }).click()
  await expect(page.locator('.form-feedback')).toContainText('Complete sending in your email app')
  await expect(page.getByLabel('Your email draft')).toContainText('reviewer@example.com')
  await expect(page.locator('[aria-invalid=true]')).toHaveCount(0)
})

test('mobile navigation, detail view, and layout work at phone sizes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.screenshot({ path: '.local/hero-mobile.png' })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const nav = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: '04 Projects' }).click()
  await expect(nav).toHaveCount(0)
  await expect(page).toHaveURL(/#projects$/)
  await page
    .getByRole('button', { name: 'Show project 03: Abu Fashion Store', exact: true })
    .click()
  await page.getByRole('button', { name: 'Explore Abu Fashion Store', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.waitForTimeout(800)
  const overflow = await page.getByRole('dialog').evaluate((el) => el.scrollWidth > el.clientWidth)
  expect(overflow).toBe(false)
  await page.screenshot({ path: '.local/project-detail-mobile.png' })
  await page.getByRole('button', { name: 'Close project details' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Horizontal overflow at ${width}px`,
    ).toBe(true)
  }
})

test('reduced motion keeps the content and interactions accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: 'View projects', exact: true }).click()
  await page
    .getByRole('button', { name: 'Show project 04: Graph Performance Analyzer', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Explore Graph Performance Analyzer', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  )
  await expect(page.locator('.sculpture canvas')).toHaveCount(0)
})
