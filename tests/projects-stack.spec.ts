import { expect, test } from '@playwright/test'

const projects = [
  ['codomax-blog', 'Codomax Blog Website', 'Codomax Blog Website', 'codomax-fullstack-blog'],
  ['campus-erp', 'Campus Store ERP', 'Campus Store Management ERP System', 'campus-store-erp'],
  ['abu-fashion', 'Abu Fashion Store', 'Abu Fashion Store', 'abu-fashion-store-updated'],
  [
    'graph-analyzer',
    'Graph Performance Analyzer',
    'Data Structure & Graph Performance Analyzer',
    'Data-Structure-and-Graph-Performance-Analyzer',
  ],
  ['swift-billing', 'SwiftBilling', 'SwiftBilling — Single-User POS System', 'Swift_Billing-'],
  [
    'university-records',
    'Student Records & Campus Routes',
    'University Student Record & Campus Route Management System',
    'University-Student-Record-Campus-Route-Management-System',
  ],
  [
    'hospital-emergency',
    'Hospital Emergency System',
    'Mini Hospital Emergency Management System',
    'MiniHospitalEmergencyManagementSystem',
  ],
] as const

test('all seven real projects open their original detail views and repository destinations, then wrap', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#projects')
  const stack = page.getByRole('region', { name: 'Project showcase', exact: true })
  await expect(stack.locator('.project-card')).toHaveCount(projects.length)
  await expect(stack.locator('.project-stack-picker > button')).toHaveCount(projects.length)
  for (const [index, [id, title, fullTitle, repository]] of projects.entries()) {
    const active = stack.locator('.project-card[data-active="true"]')
    await expect(active).toHaveAttribute('data-project-id', id)
    await expect(active.getByRole('heading', { level: 3 })).toHaveText(title)
    await expect(stack.locator('.project-stack-counter')).toHaveText(
      `${String(index + 1).padStart(2, '0')} / 07`,
    )
    await expect(stack.locator('.project-card:not([data-active="true"]):not([inert])')).toHaveCount(
      0,
    )
    const opener = active.getByRole('button', { name: `Explore ${title}`, exact: true })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(fullTitle)
    await expect(dialog.getByRole('link', { name: 'Explore the repository' })).toHaveAttribute(
      'href',
      `https://github.com/jafeerabdullah/${repository}`,
    )
    if (!index)
      await expect(dialog.getByRole('link', { name: 'Visit website' })).toHaveAttribute(
        'href',
        'https://codomax-fullstack-blog.vercel.app/',
      )
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    await stack.getByRole('button', { name: 'Next project', exact: true }).click()
  }
  await expect(stack.getByRole('status')).toHaveText('Codomax Blog Website. Project 1 of 7.')
})

test('keyboard, direct selection and rapid interrupted navigation settle on the correct card without extra canvases', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#projects')
  const stack = page.getByRole('region', { name: 'Project showcase', exact: true })
  await stack.focus()
  await page.keyboard.press('End')
  await expect(stack.getByRole('status')).toContainText('Project 7 of 7')
  await page.keyboard.press('ArrowRight')
  await expect(stack.getByRole('status')).toContainText('Project 1 of 7')
  await page.keyboard.press('ArrowLeft')
  await expect(stack.getByRole('status')).toContainText('Project 7 of 7')
  await page.keyboard.press('Home')
  await stack
    .getByRole('button', { name: 'Show project 03: Abu Fashion Store', exact: true })
    .click()
  await expect(stack.locator('.project-preview').first()).toHaveAttribute(
    'aria-label',
    'Open preview for Abu Fashion Store',
  )
  await stack.evaluate((node) => {
    for (let i = 0; i < 12; i++)
      (node.querySelector('[aria-label="Next project"]') as HTMLButtonElement).click()
  })
  await expect(stack.getByRole('status')).toHaveText('Codomax Blog Website. Project 1 of 7.')
  await expect(stack.locator('.project-card[data-active="true"]')).toHaveCSS('opacity', '1')
  await expect
    .poll(() =>
      stack.locator('.project-card[data-active="true"]').evaluate((node) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform)
        return (
          Math.abs(matrix.m41) +
          Math.abs(matrix.m42) +
          Math.abs(matrix.m43) +
          Math.abs(matrix.m11 - 1)
        )
      }),
    )
    .toBeLessThan(0.01)
  await expect(
    stack.locator(
      '.project-card[data-depth="1"], .project-card[data-depth="2"], .project-card[data-depth="3"]',
    ),
  ).toHaveCount(3)
  await expect
    .poll(() =>
      stack.evaluate((node) => {
        const top = (depth: string) =>
          node.querySelector(`[data-depth="${depth}"]`)!.getBoundingClientRect().top
        return top('1') < top('0') - 10 && top('2') < top('1') - 10 && top('3') < top('2') - 10
      }),
    )
    .toBe(true)
  const firstPreviewId = await stack.locator('.project-preview').first().getAttribute('aria-label')
  expect(firstPreviewId).toBe('Open preview for Codomax Blog Website')
  const active = stack.locator('.project-card[data-active="true"]')
  const copy = await active.locator('.project-card-copy').boundingBox()
  await active.locator('.project-preview').hover()
  expect(await active.locator('.project-card-copy').boundingBox()).toEqual(copy)
  await expect(stack.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('all cards, complete images and conceptual previews fit across desktop, tablet and small phones without layout shifts', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#projects')
  const stack = page.getByRole('region', { name: 'Project showcase', exact: true })
  for (const width of [1440, 1024, 768, 700, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    let height = 0
    for (const [index] of projects.entries()) {
      await stack.locator('.project-stack-picker > button').nth(index).click()
      const active = stack.locator('.project-card[data-active="true"]')
      const card = (await active.boundingBox())!
      expect(card.x).toBeGreaterThanOrEqual(0)
      expect(card.x + card.width).toBeLessThanOrEqual(width + 1)
      const stage = (await stack.locator('.project-stack-stage').boundingBox())!
      if (height)
        expect(Math.abs(stage.height - height), `Stable stack at ${width}px`).toBeLessThan(1)
      height = stage.height
      const preview = active.locator('.project-preview')
      const box = (await preview.boundingBox())!
      const copy = (await active.locator('.project-card-copy').boundingBox())!
      if (width > 760) expect(copy.x + copy.width).toBeLessThan(box.x)
      else expect(box.y + box.height).toBeLessThan(copy.y)
      expect(
        await active
          .locator('.project-card-copy')
          .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      ).toBe(true)
      for (const image of await preview.locator('img').all()) {
        await image.evaluate((image: HTMLImageElement) => image.decode())
        await expect(image).toHaveCSS('object-fit', 'contain')
        const rect = (await image.boundingBox())!
        expect(rect.x).toBeGreaterThanOrEqual(box.x - 1)
        expect(rect.y).toBeGreaterThanOrEqual(box.y - 1)
        expect(rect.x + rect.width).toBeLessThanOrEqual(box.x + box.width + 1)
        expect(rect.y + rect.height).toBeLessThanOrEqual(box.y + box.height + 1)
      }
      for (const element of await preview
        .locator(
          '.algorithm-cover-intro, .algorithm-cover-chart, .campus-student-card, .campus-route-plan, .terminal-window, .receipt',
        )
        .all()) {
        const rect = (await element.boundingBox())!
        expect(
          rect.x,
          `${await element.getAttribute('class')} at ${width}px`,
        ).toBeGreaterThanOrEqual(box.x - 1)
        expect(rect.y).toBeGreaterThanOrEqual(box.y - 1)
        expect(rect.x + rect.width).toBeLessThanOrEqual(box.x + box.width + 1)
        expect(rect.y + rect.height).toBeLessThanOrEqual(box.y + box.height + 1)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
  }
})

test('filters use the actual subset total, reset to a valid card, and disable navigation for one project', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#projects')
  for (const [label, total] of [
    ['Web 03', 3],
    ['Java 03', 3],
    ['Mobile 01', 1],
    ['All work 07', 7],
  ] as const) {
    await page.getByRole('button', { name: label, exact: true }).click()
    const stack = page.getByRole('region', { name: 'Project showcase', exact: true })
    await expect(stack.locator('.project-card')).toHaveCount(total)
    await expect(stack.locator('.project-stack-counter')).toHaveText(
      `01 / ${String(total).padStart(2, '0')}`,
    )
    await expect(stack.getByRole('button', { name: 'Next project', exact: true })).toBeEnabled({
      enabled: total > 1,
    })
    await expect(stack.getByRole('button', { name: 'Previous project', exact: true })).toBeEnabled({
      enabled: total > 1,
    })
  }
})

test('real touch swipes navigate projects without opening them and vertical swipes keep native scrolling', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  try {
    const page = await context.newPage()
    await page.goto('/#projects')
    const stack = page.getByRole('region', { name: 'Project showcase', exact: true })
    const client = await context.newCDPSession(page)
    async function swipe(x1: number, y1: number, x2: number, y2: number) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: x1, y: y1 }],
      })
      for (let i = 1; i <= 10; i++)
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x1 + ((x2 - x1) * i) / 10, y: y1 + ((y2 - y1) * i) / 10 }],
        })
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    const preview = stack.locator('.project-card[data-active="true"] .project-preview')
    await preview.scrollIntoViewIfNeeded()
    let box = (await preview.boundingBox())!
    await swipe(280, box.y + box.height / 2, 100, box.y + box.height / 2)
    await expect(stack.getByRole('status')).toContainText('Campus Store ERP. Project 2 of 7.')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await preview.scrollIntoViewIfNeeded()
    box = (await preview.boundingBox())!
    await swipe(100, box.y + box.height / 2, 280, box.y + box.height / 2)
    await expect(stack.getByRole('status')).toContainText('Codomax Blog Website. Project 1 of 7.')
    const before = await page.evaluate(() => scrollY)
    await swipe(195, 400, 195, 260)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 30)
    await expect(stack.getByRole('status')).toContainText('Project 1 of 7.')
    await expect(stack.locator('.project-card[data-active="true"]')).toHaveCSS('transform', 'none')
  } finally {
    await context.close()
  }
})
