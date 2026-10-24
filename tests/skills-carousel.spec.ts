import { expect, test } from '@playwright/test'

const groups = [
  ['Languages', ['Java', 'PHP', 'JavaScript', 'TypeScript', 'Dart', 'Python']],
  [
    'Web & mobile',
    ['Laravel', 'Flutter', 'Firebase', 'UI/UX Design', 'Node.js', 'Express.js', 'Supabase'],
  ],
  [
    'Data & foundations',
    ['MySQL', 'Database Management', 'Data Structures & Algorithms', 'Networking Fundamentals'],
  ],
  [
    'Tools & creative',
    [
      'Git & GitHub',
      'Jira',
      'Power BI',
      'Data Analysis',
      'Canva',
      'Adobe Photoshop',
      'Adobe Illustrator',
    ],
  ],
] as const

test('the original content and all twenty-four skills remain selectable in the correct categories', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#skills')
  const section = page.locator('#skills')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'The tools behind the thinking.',
    { useInnerText: true },
  )
  await expect(section).toContainText('From a database query to the last interface detail.')
  await expect(section).toContainText('A practical toolkit, built through real projects.')
  await expect(section).toContainText('CODE WITH STRUCTURE. DESIGN WITH INTENT.')
  const categories = section.getByRole('region', { name: 'Skill categories', exact: true })
  for (const [index, [name, skills]] of groups.entries()) {
    await expect(categories.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const category = section.locator('.skill-category-card[data-active="true"]')
    await expect(category.locator('.eyebrow')).toHaveText(`0${index + 1}`)
    await expect(category.locator('.skill-card-top > svg')).toHaveCount(1)
    const wheel = section.getByRole('region', { name: `Skills in ${name}`, exact: true })
    await expect(wheel).toBeVisible()
    await expect(wheel.locator('.skill-orbit-tag')).toHaveText([...skills])
    for (const skill of skills) {
      const button = wheel.getByRole('button', { name: skill, exact: true })
      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(section.getByRole('status')).toContainText(`${name}: ${skill},`)
    }
    await section.getByRole('button', { name: 'Next category', exact: true }).click()
  }
  await expect(categories.getByRole('button', { name: 'Languages', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await section.getByRole('button', { name: 'Previous category', exact: true }).click()
  await expect(
    categories.getByRole('button', { name: 'Tools & creative', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('all orbital labels stay readable, separate and inside the viewport at every size', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#skills')
  const section = page.locator('#skills')
  for (const width of [1440, 1024, 768, 700, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    const categoryRegion = section.getByRole('region', { name: 'Skill categories', exact: true })
    await categoryRegion.focus()
    await page.keyboard.press('Home')
    for (const [name, skills] of groups) {
      const wheel = section.getByRole('region', { name: `Skills in ${name}`, exact: true })
      await expect(wheel).toBeVisible()
      await expect(wheel.locator('.skill-orbit-tag')).toHaveCount(skills.length)
      await wheel.focus()
      for (let index = 0; index < skills.length; index++) {
        await expect
          .poll(
            async () =>
              wheel.evaluate((wheel) => {
                const bounds = wheel.getBoundingClientRect()
                const tags = [...wheel.querySelectorAll<HTMLElement>('.skill-orbit-tag')]
                const boxes = tags.map((tag) => tag.getBoundingClientRect())
                return boxes.every(
                  (box, i) =>
                    box.left >= bounds.left - 1 &&
                    box.right <= bounds.right + 1 &&
                    box.top >= bounds.top &&
                    box.bottom <= bounds.bottom &&
                    tags[i].scrollHeight <= tags[i].clientHeight + 1 &&
                    boxes.every(
                      (other, j) =>
                        i === j ||
                        Math.min(box.right, other.right) - Math.max(box.left, other.left) < 1 ||
                        Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) < 1,
                    ),
                )
              }),
            { message: `Unclipped, separate ${name} labels at ${width}px` },
          )
          .toBe(true)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        await page.keyboard.press('ArrowRight')
      }
      await section.getByRole('button', { name: 'Next category', exact: true }).click()
    }
  }
})

test('category headings and keyboard controls pause automatic rotation during manual navigation without extra canvases', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#skills')
  const section = page.locator('#skills')
  const categories = section.getByRole('region', { name: 'Skill categories', exact: true })
  await categories.getByRole('button', { name: 'Web & mobile', exact: true }).click()
  let wheel = section.getByRole('region', { name: 'Skills in Web & mobile', exact: true })
  await expect(wheel).toBeVisible()
  await wheel.getByRole('button', { name: 'Firebase', exact: true }).click()
  await expect(section.getByRole('status')).toContainText('Web & mobile: Firebase, 3 of 7')
  await expect
    .poll(async () =>
      wheel.evaluate((wheel) => {
        const selected = wheel.querySelector('[aria-pressed="true"]')!.getBoundingClientRect()
        const stage = wheel.getBoundingClientRect()
        return Math.abs(selected.x + selected.width / 2 - (stage.x + stage.width / 2))
      }),
    )
    .toBeLessThan(1)
  await wheel.focus()
  await page.keyboard.press('End')
  await expect(section.getByRole('status')).toContainText('Supabase, 7 of 7')
  await section.getByRole('button', { name: 'Next skill', exact: true }).click()
  await expect(section.getByRole('status')).toContainText('Laravel, 1 of 7')
  await section.getByRole('button', { name: 'Previous skill', exact: true }).click()
  await expect(section.getByRole('status')).toContainText('Supabase, 7 of 7')
  await categories.focus()
  await page.keyboard.press('End')
  wheel = section.getByRole('region', { name: 'Skills in Tools & creative', exact: true })
  await expect(wheel).toBeVisible()
  await page.waitForTimeout(900)
  const before = await wheel.locator('.skill-orbit-node').first().getAttribute('style')
  await page.waitForTimeout(500)
  expect(await wheel.locator('.skill-orbit-node').first().getAttribute('style')).toBe(before)
  await expect(section.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('touch gestures browse categories and skills while vertical swipes keep scrolling', async ({
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
    await page.goto('/#skills')
    const section = page.locator('#skills')
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
    const categories = section.getByRole('region', { name: 'Skill categories', exact: true })
    await categories.scrollIntoViewIfNeeded()
    const categoryBox = (await categories.boundingBox())!
    await swipe(280, categoryBox.y + 80, 100, categoryBox.y + 80)
    const wheel = section.getByRole('region', { name: 'Skills in Web & mobile', exact: true })
    await expect(wheel).toBeVisible()
    await wheel.scrollIntoViewIfNeeded()
    const box = (await wheel.boundingBox())!
    const y = box.y + box.height / 2
    await swipe(290, y, 100, y)
    await expect(section.getByRole('status')).toContainText('Flutter, 2 of 7')
    await swipe(100, y, 290, y)
    await expect(section.getByRole('status')).toContainText('Laravel, 1 of 7')
    const scrollBefore = await page.evaluate(() => scrollY)
    await swipe(195, y, 195, y - 130)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 30)
    await expect(section.getByRole('status')).toContainText('Laravel, 1 of 7')
  } finally {
    await context.close()
  }
})
