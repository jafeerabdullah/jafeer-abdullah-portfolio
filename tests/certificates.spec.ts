import { expect, test } from '@playwright/test'

test('medium certificate slides stay aligned and uncropped at every breakpoint', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#certificates')
  await page.evaluate(() => document.fonts.ready)
  const gallery = page.getByRole('region', { name: 'Certificate gallery', exact: true })
  for (const width of [1440, 1024, 768, 701, 700, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await gallery.focus()
    await page.keyboard.press('Home')
    let first = null
    for (let index = 0; index < 7; index++) {
      const card = page.locator('.certificate-card[data-active="true"]')
      await expect(page.locator('#certificates').getByRole('status')).toContainText(
        index + 1 + ' of 7:',
      )
      await expect(page.locator('.certificate-slot[data-position="0"]')).toHaveCSS(
        'transform',
        'none',
      )
      const result = await card.evaluate((card) => {
        const box = card.getBoundingClientRect()
        const stage = card.closest('.certificate-carousel')!.getBoundingClientRect()
        const image = card.querySelector('img')!
        return {
          width: box.width,
          height: box.height,
          inside: box.left >= stage.left - 1 && box.right <= stage.right + 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
          clipped: card.scrollHeight > card.clientHeight + 1,
          fit: getComputedStyle(image).objectFit,
          fields: [...card.children].map((field) =>
            Math.round(field.getBoundingClientRect().top - box.top),
          ),
        }
      })
      expect(result.overflow).toBe(false)
      expect(result.inside).toBe(true)
      expect(result.clipped).toBe(false)
      expect(result.width).toBeLessThanOrEqual(421)
      expect(result.height).toBeLessThanOrEqual(481)
      expect(result.fit).toBe('contain')
      if (!first) first = result
      else {
        expect(result.width).toBeCloseTo(first.width, 0)
        expect(result.height).toBeCloseTo(first.height, 0)
        expect(result.fields).toEqual(first.fields)
      }
      await page.keyboard.press('ArrowRight')
    }
  }
})

test('certificate archive filters unique documents and retains the supplied badge links', async ({
  page,
  request,
}) => {
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Certificates', exact: true })
    .click()
  await expect(page).toHaveURL(/#certificates$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-page-morph', 'true')
  await expect(page.getByRole('heading', { name: 'Certifications' })).toBeVisible()
  const archive = page.locator('#certificates')
  await expect(archive.locator('.certificate-card')).toHaveCount(7)
  await expect(archive.getByRole('link', { name: 'Credly badge', exact: true })).toHaveCount(1)
  const networking = archive
    .locator('.certificate-card')
    .filter({ has: page.getByRole('heading', { name: 'Networking Basics', exact: true }) })
  await expect(networking.getByRole('link', { name: 'Credly badge', exact: true })).toHaveAttribute(
    'href',
    'https://www.credly.com/badges/1d8dec9b-1ff4-4e22-8e6e-e022567abf56/public_url',
  )
  await page.getByRole('button', { name: 'Next certificate', exact: true }).click()
  const cybersecurity = archive
    .locator('.certificate-card')
    .filter({ hasText: 'Introduction to Cybersecurity' })
  await expect(
    cybersecurity.getByRole('link', { name: 'Credly badge', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://www.credly.com/badges/66bad64b-5a51-4334-affd-809ee43f06a9/public_url',
  )
  await archive.getByRole('button', { name: 'Technology 03', exact: true }).click()
  await expect(archive.locator('.certificate-card')).toHaveCount(3)
  await expect(archive.locator('.certificate-card').last()).toContainText(
    'Information Technology & Open Office',
  )
  await archive.getByRole('button', { name: 'Academic 01', exact: true }).click()
  await expect(archive.locator('.certificate-card')).toHaveCount(1)
  await archive.getByRole('button', { name: 'View certificate', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('6 A passes · 3 B passes')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await archive.getByRole('button', { name: 'Achievements 03', exact: true }).click()
  await expect(archive.locator('.certificate-card')).toHaveCount(3)
  await expect(
    archive.getByRole('heading', { name: 'Energy Club Competition — Innovation', exact: true }),
  ).toHaveCount(1)
  await archive.getByRole('button', { name: 'All certificates 07', exact: true }).click()
  await expect(archive.locator('.certificate-card')).toHaveCount(7)
  for (const path of ['networking-basics', 'introduction-to-cybersecurity']) {
    const response = await request.get(`/certificates/${path}.pdf`)
    expect(response.ok()).toBe(true)
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF')
  }
})

test('certificate reader zooms, downloads the original, traps focus and restores its opener', async ({
  page,
}) => {
  await page.goto('/#certificates')
  const opener = page.getByRole('button', {
    name: 'Preview Networking Basics certificate',
    exact: true,
  })
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Networking Basics')
  await expect(dialog).toContainText('19 October 2026')
  await expect(page.locator('.app-shell')).toHaveAttribute('inert', '')
  await expect(
    dialog.getByRole('button', { name: 'Close certificate preview', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('link', { name: 'Open readable preview', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'Close certificate preview', exact: true }),
  ).toBeFocused()
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(dialog.locator('.certificate-zoom')).toContainText('150%')
  expect(
    await dialog.locator('.certificate-document').evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true)
  await dialog.getByRole('button', { name: 'Fit document', exact: true }).click()
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeDisabled()
  const download = page.waitForEvent('download')
  await dialog.getByRole('link', { name: 'Download original PDF', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('networking-basics.pdf')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('region', { name: 'Certificate gallery', exact: true }).focus()
  await page.keyboard.press('End')
  await page
    .getByRole('button', {
      name: 'Preview Basics of Islamic Studies & Arabic Language certificate',
      exact: true,
    })
    .click()
  await expect(dialog).toBeVisible()
  const image = dialog.getByRole('img', {
    name: 'Basics of Islamic Studies & Arabic Language certificate, issued to Jafeer Abdullah',
    exact: true,
  })
  await expect
    .poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalHeight))
    .toBeGreaterThan(0)
  expect(
    await image.evaluate(
      (img) => (img as HTMLImageElement).naturalHeight > (img as HTMLImageElement).naturalWidth,
    ),
  ).toBe(true)
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
  await dialog
    .getByRole('link', { name: 'Download original JPG', exact: true })
    .scrollIntoViewIfNeeded()
  await expect(
    dialog.getByRole('link', { name: 'Download original JPG', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: '06 Certificates', exact: true })
    .click()
  await expect(page).toHaveURL(/#certificates$/)
})

test('Codomax project presents the actual full stack implementation and website', async ({
  page,
}) => {
  await page.goto('/#projects')
  await page.getByRole('button', { name: 'Explore Codomax Blog Website', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Codomax Blog Website')
  await expect(dialog).toContainText('Express.js')
  await expect(dialog).toContainText('PostgreSQL')
  await expect(dialog).toContainText('Private drafts and published stories')
  await expect(dialog.getByRole('link', { name: 'Explore the repository' })).toHaveAttribute(
    'href',
    'https://github.com/jafeerabdullah/codomax-fullstack-blog',
  )
  await expect(dialog.getByRole('link', { name: 'Visit website' })).toHaveAttribute(
    'href',
    'https://codomax-fullstack-blog.vercel.app/',
  )
  await expect(
    dialog.getByAltText(
      'Actual Codomax Journal homepage showing the editorial blog and article discovery interface',
    ),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})
