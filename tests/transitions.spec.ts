import { expect, test } from '@playwright/test'

test('portrait morph tracks scrolling in both directions and settles into the real About photo', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const bridge = page.locator('.portrait-bridge')
  await expect(bridge).toBeVisible()
  const start = (await bridge.boundingBox())!
  const end = await page.evaluate(() => {
    const source = document.querySelector('#home .hero-portrait-frame')!.getBoundingClientRect()
    const target = document.querySelector('#about .about-photo-wrap')!.getBoundingClientRect()
    const reveal = new DOMMatrixReadOnly(
      getComputedStyle(document.querySelector('#about .about-visual')!).transform,
    ).m42
    return target.top - reveal - source.top
  })
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), end * 0.5)
  await expect.poll(async () => (await bridge.boundingBox())!.width).toBeLessThan(start.width - 20)
  const middle = (await bridge.boundingBox())!
  expect(middle.x).toBeLessThan(start.x)
  await expect(page.locator('#home .hero-bottom')).toHaveAttribute('inert', '')
  expect(Math.abs(middle.y - start.y)).toBeLessThan(2)
  expect(
    await bridge.evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius)),
  ).toBeGreaterThan(0)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), end + 8)
  await expect(bridge).toBeHidden()
  await expect(page.locator('#about .about-photo-wrap')).toHaveCSS('opacity', '1')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(bridge).toBeVisible()
  await expect(page.locator('#home .hero-bottom')).not.toHaveAttribute('inert', '')
  await expect.poll(async () => (await bridge.boundingBox())!.width).toBeCloseTo(start.width, 0)
  expect(errors).toEqual([])
})

test('section navigation morphs actual snapshots, supports Back, and restores keyboard focus', async ({
  page,
}) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  await nav.getByRole('link', { name: 'About', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-page-morph', 'true')
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .some((animation) => (animation as CSSAnimation).animationName === 'morph-page-iris'),
  )
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
  await expect(page).toHaveURL(/#about$/)
  await expect(page.locator('#about h2')).toBeFocused()
  await nav.getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
  await page.goBack()
  await expect(page).toHaveURL(/#about$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
  await expect(page.locator('#about h2')).toBeFocused()
  expect(await page.locator('[style*="view-transition-name"]').count()).toBe(0)
  await nav.getByRole('link', { name: 'Projects', exact: true }).focus()
  await page.keyboard.press('Enter')
  await nav.getByRole('link', { name: 'Skills', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#skills$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
})

test('the rounded aperture fallback navigates and reduced motion bypasses all page morphs', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      configurable: true,
    }),
  )
  await page.goto('/')
  await page.getByRole('link', { name: 'View projects', exact: true }).click()
  await expect(page.locator('.page-morph-fallback')).toBeVisible()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('.page-morph-fallback')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: 'View projects', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('.portrait-bridge')).toHaveCount(0)
  await expect(page.locator('.page-morph-fallback')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
})
