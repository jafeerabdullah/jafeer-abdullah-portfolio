import { expect, test } from '@playwright/test'

test('every certificate uses its matched high resolution source on a dark, uncropped preview', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#certificates')
  const expected = [
    ['Networking Basics', 'networking-basics-hq.png', 2376, 1836],
    ['Introduction to Cybersecurity', 'introduction-to-cybersecurity-hq.png', 2376, 1836],
    ['Information Technology & Open Office', 'icta-open-office-hq.jpg', 3200, 2287],
    ['G.C.E. Ordinary Level', 'gce-ordinary-level-hq.jpg', 2263, 3200],
    ['Energy Club Competition — Innovation', 'energy-club-innovation-hq.jpg', 3055, 2133],
  ] as const
  const gallery = page.getByRole('region', { name: 'Certificate gallery', exact: true })
  await gallery.focus()
  for (const [title, filename, width, height] of expected) {
    const card = page
      .locator('.certificate-card')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    const image = card.locator('img')
    await image.scrollIntoViewIfNeeded()
    await image.evaluate((node: HTMLImageElement) => node.decode())
    await expect(image).toHaveAttribute('src', `/certificates/${filename}`)
    expect(
      await image.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight]),
    ).toEqual([width, height])
    await expect(image).toHaveCSS('object-fit', 'contain')
    await expect(image).toHaveCSS('border-top-width', '0px')
    await expect(image).toHaveCSS('box-shadow', 'none')
    await expect(card.locator('.certificate-preview')).toHaveCSS(
      'background-color',
      'rgb(16, 17, 15)',
    )
    const response = await request.get(`/certificates/${filename}`)
    expect(response.ok()).toBe(true)
    await gallery.focus()
    await page.keyboard.press('ArrowRight')
  }
  await gallery.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page
    .getByRole('button', {
      name: 'Preview Information Technology & Open Office certificate',
      exact: true,
    })
    .click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.certificate-reader')).toHaveCSS(
    'background-color',
    'rgb(16, 17, 15)',
  )
  await expect(dialog.locator('img')).toHaveAttribute(
    'src',
    '/certificates/icta-open-office-hq.jpg',
  )
  await expect(
    dialog.getByRole('link', { name: 'Download original JPG', exact: true }),
  ).toHaveAttribute('href', '/certificates/icta-open-office-hq.jpg')
})

test('certificates reveal on entry, lift gently on hover, and keep motion optional', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.locator('.certificate-card').first()
  await expect(page.locator('.certificate-carousel')).toHaveCSS('opacity', '0')
  await card.scrollIntoViewIfNeeded()
  await expect(page.locator('.certificate-carousel')).toHaveCSS('opacity', '1')
  await expect(card).toHaveCSS('transform', 'none')
  const start = await card.boundingBox()
  await card.hover()
  await expect(card).toHaveCSS('translate', '0px -3px')
  expect((await card.boundingBox())!.height).toBe(start!.height)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await card.scrollIntoViewIfNeeded()
  await card.hover()
  await expect(card).toHaveCSS('opacity', '1')
  await expect(card).toHaveCSS('translate', 'none')
})
