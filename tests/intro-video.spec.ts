import { expect, test } from '@playwright/test'

test('portrait control opens a silent dialog, traps focus, and restores the unchanged home', async ({
  page,
}) => {
  const requests: string[] = []
  const failures: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('jafeer-intro.mp4')) requests.push(request.url())
  })
  page.on('pageerror', (error) => failures.push(error.message))
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Meet Me — open introduction video' })
  await expect(opener).toBeEnabled()
  await page.mouse.move(10, 400)
  await expect(opener).toHaveCSS('opacity', '0')
  await page.locator('.intro-video-entry').hover({ force: true })
  await expect(opener).toHaveCSS('opacity', '1')
  await page.mouse.move(10, 400)
  await opener.focus()
  await expect(opener).toHaveCSS('opacity', '1')
  expect(requests).toEqual([])
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'instant' }))
  await page.waitForTimeout(200)
  const position = await page.evaluate(() => scrollY)
  const portrait = await page.locator('.hero-portrait-frame').boundingBox()
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Meet Jafeer Abdullah.' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('.app-shell')).toHaveAttribute('inert', '')
  await expect(dialog.getByRole('button', { name: 'Close introduction video' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('slider', { name: 'Video volume' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Close introduction video' })).toBeFocused()
  await expect
    .poll(() => dialog.locator('video').evaluate((v: HTMLVideoElement) => v.readyState))
    .toBeGreaterThan(0)
  expect(
    await dialog
      .locator('video')
      .evaluate((v: HTMLVideoElement) => ({
        paused: v.paused,
        time: v.currentTime,
        autoplay: v.autoplay,
      })),
  ).toEqual({ paused: true, time: 0, autoplay: false })
  expect(requests.length).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.app-shell')).not.toHaveAttribute('inert', '')
  await expect(opener).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBe(position)
  expect(await page.locator('.hero-portrait-frame').boundingBox()).toEqual(portrait)
  await expect(page).toHaveURL(/\/$/)
  expect(failures).toEqual([])
})

test('the supplied video plays, pauses, changes volume, replays, and stops on backdrop close', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Meet Me — open introduction video' }).click()
  const dialog = page.getByRole('dialog')
  const video = dialog.locator('video')
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBe(1920)
  expect(await video.evaluate((v: HTMLVideoElement) => v.videoHeight)).toBe(1080)
  expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(24.289, 1)
  await dialog.getByRole('button', { name: 'Play introduction video', exact: true }).click()
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0.1)
  await dialog.getByRole('button', { name: 'Pause introduction', exact: true }).click()
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
  const time = await video.evaluate((v: HTMLVideoElement) => v.currentTime)
  await page.waitForTimeout(200)
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(time)
  await dialog.getByRole('slider', { name: 'Video volume' }).fill('0.35')
  expect(await video.evaluate((v: HTMLVideoElement) => v.volume)).toBeCloseTo(0.35)
  await dialog.getByRole('button', { name: 'Mute introduction', exact: true }).click()
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true)
  await dialog.getByRole('button', { name: 'Unmute introduction', exact: true }).click()
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false)
  await dialog.getByRole('slider', { name: 'Video position' }).fill('12')
  await dialog.getByRole('button', { name: 'Replay introduction', exact: true }).click()
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false)
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2)
  await page.evaluate(() => {
    ;(window as unknown as { introMedia: HTMLVideoElement }).introMedia = document.querySelector(
      '.intro-video-screen video',
    )!
  })
  await page.locator('.intro-video-backdrop').click({ position: { x: 5, y: 5 } })
  await expect(dialog).toHaveCount(0)
  expect(
    await page.evaluate(
      () => (window as unknown as { introMedia: HTMLVideoElement }).introMedia.paused,
    ),
  ).toBe(true)
  expect(
    await page.evaluate(() =>
      (window as unknown as { introMedia: HTMLVideoElement }).introMedia.hasAttribute('src'),
    ),
  ).toBe(false)
})

test('natural playback completion reveals Explore My Work and uses existing project navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Meet Me — open introduction video' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Explore My Work' })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Replay introduction' })).toBeEnabled()
  await dialog.locator('video').evaluate((v: HTMLVideoElement) => {
    v.currentTime = v.duration - 0.3
  })
  await dialog.getByRole('button', { name: 'Play introduction video', exact: true }).click()
  await expect(dialog.getByRole('button', { name: 'Explore My Work' })).toBeVisible()
  expect(await dialog.locator('video').evaluate((v: HTMLVideoElement) => v.ended)).toBe(true)
  await dialog.getByRole('button', { name: 'Explore My Work' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('#projects h2')).toBeFocused()
  await expect(page.locator('.app-shell')).not.toHaveAttribute('inert', '')
})

test('mobile and tablet controls stay visible, fit the screen, and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    const opener = page.getByRole('button', { name: 'Meet Me — open introduction video' })
    await expect(opener).toHaveCSS('opacity', '1')
    const box = await opener.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    await expect(dialog.getByRole('button', { name: 'Close introduction video' })).toBeInViewport()
    await expect(dialog.getByRole('slider', { name: 'Video volume' })).toBeInViewport()
    expect(await dialog.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
    if (width === 390) await page.screenshot({ path: '.local/intro-video-mobile.png' })
    await dialog.getByRole('button', { name: 'Close introduction video' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  }
})
