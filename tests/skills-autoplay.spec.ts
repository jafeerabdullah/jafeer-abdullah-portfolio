import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// Sample at 10 fps without waiting through minutes of wall-clock time. Each step
// yields to React and Motion, so state changes and DOM transforms can both commit.
async function advance(page: Page, milliseconds: number) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 100)
    await page.clock.fastForward(Math.min(100, milliseconds - elapsed))
}

async function openWheel(page: Page) {
  const start = new Date('2026-10-24T00:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(new Date(start.getTime() + 1000))
  await page.goto('/#skills')
  const wheel = page.getByRole('region', { name: 'Skills in Languages', exact: true })
  await wheel.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await advance(page, 1000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')
  return wheel
}

test('two complete orbits reverse smoothly and keep every automatic logo, name and counter synchronized', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const wheel = await openWheel(page)
  await wheel.evaluate((element) => {
    const hub = element.querySelector<HTMLElement>('.skill-orbit-hub')!
    const names: string[] = ['Java']
    const problems: string[] = []
    const samples: { name: string; x: number; y: number }[] = []
    Object.assign(window, { orbitReview: { names, problems, samples } })
    new MutationObserver(() => {
      const name = hub.dataset.selectedSkill!
      if (names.at(-1) === name) return
      names.push(name)
      const selected = element.querySelector<HTMLButtonElement>(
        '.skill-orbit-tag[aria-pressed="true"]',
      )!
      const index = [...element.querySelectorAll('.skill-orbit-tag')].indexOf(selected)
      if (
        hub.querySelector('.skill-selected-name')!.textContent !== name ||
        hub.querySelector<HTMLElement>('[data-skill-icon]')!.dataset.skillIcon !== name ||
        selected.getAttribute('aria-label') !== name ||
        !hub.querySelector('.eyebrow')!.textContent!.includes(String(index + 1).padStart(2, '0'))
      )
        problems.push(`Mismatch for ${name}`)
      const icon = selected.getBoundingClientRect()
      const stage = element.getBoundingClientRect()
      samples.push({
        name,
        x: icon.x + icon.width / 2 - (stage.x + stage.width / 2),
        y: icon.y + icon.height / 2 - (stage.y + stage.height / 2),
      })
    }).observe(hub, { attributes: true, attributeFilter: ['data-selected-skill'] })
  })
  const hubBefore = await wheel.locator('.skill-orbit-hub').boundingBox()
  await advance(page, 71_000)
  await expect(wheel).toHaveAttribute('data-direction', 'clockwise')
  const firstIcon = wheel.locator('.skill-orbit-node').first()
  const nearTurn = await firstIcon.boundingBox()
  await advance(page, 1500)
  await expect(wheel).toHaveAttribute('data-direction', 'counterclockwise')
  const afterTurn = await firstIcon.boundingBox()
  // The turnaround stays close to its starting position instead of snapping around the ring.
  expect(Math.abs(afterTurn!.x - nearTurn!.x)).toBeLessThan(12)
  await advance(page, 72_500)
  await expect(wheel).toHaveAttribute('data-direction', 'clockwise')
  const review = await page.evaluate(
    () =>
      (
        window as unknown as {
          orbitReview: {
            names: string[]
            problems: string[]
            samples: { name: string; x: number; y: number }[]
          }
        }
      ).orbitReview,
  )
  expect(review.names).toEqual([
    'Java',
    'PHP',
    'JavaScript',
    'TypeScript',
    'Dart',
    'Python',
    'Java',
    'Python',
    'Dart',
    'TypeScript',
    'JavaScript',
    'PHP',
    'Java',
  ])
  expect(review.problems).toEqual([])
  expect(review.samples.every((sample) => Math.abs(sample.x) < 6 && sample.y > 150)).toBe(true)
  expect(await wheel.locator('.skill-orbit-hub').boundingBox()).toEqual(hubBefore)
  await expect(page.locator('#skills canvas')).toHaveCount(0)
})

test('manual selection gets four seconds, then resumes; hover, keyboard focus and the pause control take priority', async ({
  page,
}) => {
  const wheel = await openWheel(page)
  const section = page.locator('#skills')
  await advance(page, 6000)
  await section.getByRole('button', { name: 'Next skill', exact: true }).click()
  await page.mouse.move(0, 0)
  await advance(page, 1500)
  await expect(wheel.locator('.skill-orbit-hub')).toHaveAttribute('data-selected-skill', 'PHP')
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  const node = wheel.locator('.skill-orbit-node').first()
  const settled = await node.getAttribute('style')
  await advance(page, 2200)
  expect(await node.getAttribute('style')).toBe(settled)
  await advance(page, 2000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')
  expect(await node.getAttribute('style')).not.toBe(settled)

  await wheel.hover()
  await advance(page, 100)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  const hovered = await node.getAttribute('style')
  await advance(page, 6000)
  expect(await node.getAttribute('style')).toBe(hovered)
  await page.mouse.move(0, 0)
  await advance(page, 1500)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')

  await wheel.focus()
  await page.keyboard.press('ArrowRight')
  await advance(page, 6000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  await expect(wheel.locator('.skill-orbit-hub')).toHaveAttribute(
    'data-selected-skill',
    'JavaScript',
  )
  await section.getByRole('button', { name: 'Pause automatic rotation' }).click()
  await page.mouse.move(0, 0)
  await advance(page, 6000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  const stopped = await node.getAttribute('style')
  await advance(page, 6000)
  expect(await node.getAttribute('style')).toBe(stopped)
  await section.getByRole('button', { name: 'Resume automatic rotation' }).click()
  await page.mouse.move(0, 0)
  await advance(page, 6000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')
})

test('all category lengths auto-select correctly, preserving direction across category changes', async ({
  page,
}) => {
  test.setTimeout(90_000)
  // Playwright's virtual clock cannot advance native WAAPI timelines. Exercise
  // Motion's JS fallback here; the regular skills tests cover native category fades.
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'animate', { value: undefined, configurable: true })
  })
  await openWheel(page)
  await advance(page, 73_000)
  const section = page.locator('#skills')
  const cases = [
    ['Web & mobile', 'Supabase', '07 / 07'],
    ['Data & foundations', 'Networking Fundamentals', '04 / 04'],
    ['Tools & creative', 'Adobe Illustrator', '07 / 07'],
  ]
  for (const [category, name, counter] of cases) {
    // Let the existing browser-driven category fade finish before freezing time.
    await page.clock.resume()
    await section.getByRole('button', { name: 'Next category', exact: true }).click()
    const wheel = section.getByRole('region', { name: `Skills in ${category}`, exact: true })
    await expect(wheel).toBeVisible()
    await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 1000))
    await wheel.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await expect(wheel).toHaveAttribute('data-direction', 'counterclockwise')
    await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
    await advance(page, category === 'Data & foundations' ? 27_000 : 21_000)
    await expect(wheel.locator('.skill-orbit-hub')).toHaveAttribute('data-selected-skill', name)
    await expect(wheel.locator('.skill-orbit-hub .eyebrow')).toHaveText(counter)
  }
})

test('background and orbit pause offscreen or in a hidden tab, and reduced motion stays static on mobile', async ({
  page,
}) => {
  const wheel = await openWheel(page)
  const scene = page.locator('.skills-carousel')
  const star = scene.locator('.skills-star').first()
  await expect(scene.locator('.skills-star')).toHaveCount(26)
  await expect(scene.locator('.skills-atmosphere')).toHaveCSS('pointer-events', 'none')
  await expect(star).toHaveCSS('animation-play-state', 'running, running')
  await advance(page, 4000)
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await advance(page, 1000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  await expect(scene).toHaveAttribute('data-atmosphere-active', 'false')
  const offscreen = await wheel.locator('.skill-orbit-node').first().getAttribute('style')
  await advance(page, 6000)
  expect(await wheel.locator('.skill-orbit-node').first().getAttribute('style')).toBe(offscreen)
  await wheel.scrollIntoViewIfNeeded()
  await advance(page, 1000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await advance(page, 5000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'paused')
  await expect(scene).toHaveAttribute('data-atmosphere-active', 'false')
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await advance(page, 1000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'running')
  await page.setViewportSize({ width: 320, height: 850 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await advance(page, 1000)
  await expect(wheel).toHaveAttribute('data-auto-rotation', 'reduced')
  await expect(scene.locator('.skills-nebula')).toHaveCSS('animation-name', 'none')
  await expect(star).toHaveCSS('animation-name', 'none')
  const reduced = await wheel.locator('.skill-orbit-node').first().getAttribute('style')
  await advance(page, 10_000)
  expect(await wheel.locator('.skill-orbit-node').first().getAttribute('style')).toBe(reduced)
  await wheel.getByRole('button', { name: 'Python', exact: true }).click()
  await expect(wheel.locator('.skill-orbit-hub')).toHaveAttribute('data-selected-skill', 'Python')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
