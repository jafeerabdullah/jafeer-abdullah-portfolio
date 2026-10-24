import { expect, test } from '@playwright/test'

const roles = [
  ['Full Stack Developer', '🚀'],
  ['UI/UX Designer', '🎨'],
  ['Digital Creator', '📈'],
  ['Data Analyst', '📊'],
  ['Graphic Designer', '🖌️'],
] as const

test('the initial role is present immediately and all five roles type, delete, and loop in order', async ({
  page,
}) => {
  test.setTimeout(45_000)
  await page.goto('/')
  const text = page.locator('.hero-role-text')
  await expect(text).toHaveText(roles[0][0])
  const labels = roles.map(([label]) => label)
  await page.evaluate((labels) => {
    const node = document.querySelector('.hero-role-text')!
    const samples = [
      { text: node.textContent!, emoji: document.querySelector('.hero-role-emoji')!.textContent! },
    ]
    const completed = [node.textContent!]
    Object.assign(window, { roleReview: { samples, completed } })
    new MutationObserver(() => {
      const value = node.textContent!
      samples.push({ text: value, emoji: document.querySelector('.hero-role-emoji')!.textContent! })
      if (labels.includes(value) && completed.at(-1) !== value) completed.push(value)
    }).observe(node, { childList: true, characterData: true, subtree: true })
  }, labels)
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.hero-intro')).toHaveCSS('opacity', '1')
  const geometry = () =>
    page.evaluate(() =>
      ['.hero-headline', '.hero-intro > p', '.hero-actions', '.hero-portrait-frame'].map(
        (selector) => {
          const r = document.querySelector(selector)!.getBoundingClientRect()
          return { x: r.x, y: r.y, width: r.width, height: r.height }
        },
      ),
    )
  const initialGeometry = await geometry()
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as unknown as { roleReview: { completed: string[] } }).roleReview.completed,
        ),
      { timeout: 35_000 },
    )
    .toEqual([...labels, labels[0]])
  expect(await geometry()).toEqual(initialGeometry)
  const samples = await page.evaluate(
    () =>
      (window as unknown as { roleReview: { samples: { text: string; emoji: string }[] } })
        .roleReview.samples,
  )
  let typed = false,
    deleted = false
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i]
    const role = roles.find(([, emoji]) => emoji === sample.emoji)
    expect(role).toBeDefined()
    expect(
      role![0].startsWith(sample.text),
      `Invalid or duplicated characters: ${sample.text}`,
    ).toBe(true)
    if (i > 0 && samples[i - 1].emoji === sample.emoji) {
      typed ||= sample.text.length > samples[i - 1].text.length
      deleted ||= sample.text.length < samples[i - 1].text.length
    }
  }
  expect(typed).toBe(true)
  expect(deleted).toBe(true)
  await expect(page.locator('.hero-role-cursor')).toHaveCSS(
    'animation-name',
    'hero-role-caret-blink',
  )
  await expect(page.locator('.hero-role-cursor')).toHaveCSS('background-color', 'rgb(182, 154, 99)')
})

test('every role fits at phone, tablet, and desktop widths with a static accessible reduced-motion fallback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const heading = page.locator('.hero-headline')
    for (const [label] of roles) await expect(heading).toHaveAccessibleName(new RegExp(label))
    await expect(page.locator('.hero-role-text')).toHaveText(roles[0][0])
    await expect(page.locator('.hero-role-cursor')).toHaveCSS('animation-name', 'none')
    await expect(page.locator('.hero-typewriter')).toHaveAttribute('data-running', 'false')
    const result = await page.evaluate((roles) => {
      const row = document.querySelector('.hero-typewriter')!
      const text = document.querySelector('.hero-role-text')!
      const emoji = document.querySelector('.hero-role-emoji')!
      const cursor = document.querySelector('.hero-role-cursor')!
      const initialHeight = row.getBoundingClientRect().height
      const checks = roles.map(([label, icon]) => {
        text.textContent = label
        emoji.textContent = icon
        const line = row.getBoundingClientRect(),
          caret = cursor.getBoundingClientRect(),
          word = text.getBoundingClientRect()
        return {
          label,
          height: line.height,
          fits: caret.right <= line.right + 0.5,
          cursorFollowsText: caret.left >= word.right,
          singleLine: word.height <= line.height + 0.5,
        }
      })
      return { initialHeight, checks, overflow: document.documentElement.scrollWidth > innerWidth }
    }, roles)
    expect(result.overflow, `Overflow at ${width}px`).toBe(false)
    for (const check of result.checks) {
      expect(check.fits, `${check.label} clipped at ${width}px`).toBe(true)
      expect(check.singleLine).toBe(true)
      expect(check.cursorFollowsText).toBe(true)
      expect(check.height).toBe(result.initialHeight)
    }
  }
})

test('typing pauses offscreen and resumes without resetting or running duplicate timers', async ({
  page,
}) => {
  await page.goto('/')
  const row = page.locator('.hero-typewriter')
  await expect(row).toHaveAttribute('data-running', 'true')
  await page.evaluate(() => scrollTo({ top: 1800, behavior: 'instant' }))
  await expect(row).toHaveAttribute('data-running', 'false')
  const text = await page.locator('.hero-role-text').textContent()
  await page.waitForTimeout(400)
  await expect(page.locator('.hero-role-text')).toHaveText(text!)
  await expect(page.locator('.hero-role-cursor')).toHaveCSS('animation-name', 'none')
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await expect(row).toHaveAttribute('data-running', 'true')
  await expect.poll(() => page.locator('.hero-role-text').textContent()).not.toBe(text)
})
