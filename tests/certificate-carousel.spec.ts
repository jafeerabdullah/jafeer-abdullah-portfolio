import { expect, test } from '@playwright/test'

test('coverflow wraps, selects side cards, handles keys and mouse drags without opening the reader', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#certificates')
  const gallery = page.getByRole('region', { name: 'Certificate gallery', exact: true })
  const status = page.locator('#certificates').getByRole('status')
  await gallery.scrollIntoViewIfNeeded()
  await expect(gallery).toHaveCSS('opacity', '1')
  await page.getByRole('button', { name: 'Previous certificate', exact: true }).click()
  await expect(status).toHaveText('7 of 7: Basics of Islamic Studies & Arabic Language')
  await page.getByRole('button', { name: 'Next certificate', exact: true }).click()
  await expect(status).toHaveText('1 of 7: Networking Basics')
  await page
    .getByRole('button', { name: 'Show Introduction to Cybersecurity', exact: true })
    .click()
  await expect(status).toHaveText('2 of 7: Introduction to Cybersecurity')
  await expect(gallery).toBeFocused()
  await page.keyboard.press('End')
  await expect(status).toContainText('7 of 7:')
  await page.keyboard.press('ArrowRight')
  await expect(status).toContainText('1 of 7:')
  await page.keyboard.press('ArrowLeft')
  await expect(status).toContainText('7 of 7:')
  await page.keyboard.press('Home')
  await expect(status).toContainText('1 of 7:')
  await expect(page.locator('.certificate-slot[data-position="0"]')).toHaveCSS('transform', 'none')
  const preview = (await page
    .locator('.certificate-card[data-active="true"] .certificate-preview')
    .boundingBox())!
  const x = preview.x + preview.width * 0.7,
    y = preview.y + preview.height * 0.5
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 160, y + 2, { steps: 12 })
  await page.mouse.up()
  await expect(status).toHaveText('2 of 7: Introduction to Cybersecurity')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.certificate-track')).toHaveCSS('transform', 'none')
  expect(errors).toEqual([])
})

test('real touch swipes browse certificates and vertical gestures remain available for scrolling', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  try {
    await page.goto('/#certificates')
    const gallery = page.getByRole('region', { name: 'Certificate gallery', exact: true })
    await gallery.scrollIntoViewIfNeeded()
    const preview = (await page
      .locator('.certificate-card[data-active="true"] .certificate-preview')
      .boundingBox())!
    const client = await context.newCDPSession(page)
    const y = preview.y + preview.height * 0.7
    async function swipe(from: number, to: number) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: from, y }],
      })
      for (let step = 1; step <= 8; step++)
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: from + ((to - from) * step) / 8, y }],
        })
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    await swipe(290, 100)
    await expect(page.locator('#certificates').getByRole('status')).toHaveText(
      '2 of 7: Introduction to Cybersecurity',
    )
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await swipe(100, 290)
    await expect(page.locator('#certificates').getByRole('status')).toHaveText(
      '1 of 7: Networking Basics',
    )
    await expect(gallery).toHaveCSS('touch-action', 'pan-y pinch-zoom')
    const scrollBefore = await page.evaluate(() => scrollY)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 195, y }],
    })
    for (let step = 1; step <= 8; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: 195, y: y - step * 15 }],
      })
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 30)
    await expect(page.locator('#certificates').getByRole('status')).toHaveText(
      '1 of 7: Networking Basics',
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally {
    await context.close()
  }
})

test('navbar keeps every label, destination, active state, mobile order and original résumé download', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const names = ['Home', 'About', 'Skills', 'Projects', 'Education', 'Certificates', 'Contact']
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  expect(await nav.getByRole('link').allTextContents()).toEqual(names)
  for (const name of names) {
    const link = nav.getByRole('link', { name, exact: true })
    await expect(link).toHaveAttribute('href', `#${name.toLowerCase()}`)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`))
    await expect(link).toHaveAttribute('aria-current', 'location')
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1)
  }
  await page.locator('#skills').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
  await expect(nav.getByRole('link', { name: 'Skills', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  )
  const resume = page.locator('.nav-resume')
  await expect(resume).toHaveAttribute('href', '/documents/Jafeer-Abdullah-CV.pdf')
  const download = page.waitForEvent('download')
  await resume.click()
  expect((await download).suggestedFilename()).toBe('Jafeer-Abdullah-CV.pdf')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const mobile = page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
  const mobileLinks = await mobile.getByRole('link').all()
  for (let index = 0; index < names.length; index++) {
    await expect(mobileLinks[index]).toContainText(names[index])
    await expect(mobileLinks[index]).toHaveAttribute('href', `#${names[index].toLowerCase()}`)
  }
  await mobile.getByRole('link', { name: '06 Certificates', exact: true }).click()
  await expect(page).toHaveURL(/#certificates$/)
  await expect(mobile).toHaveCount(0)
})
