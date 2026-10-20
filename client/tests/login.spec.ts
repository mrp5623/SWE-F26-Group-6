import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const demoEmail = 'demo@nutrigator.app'
const demoPassword = 'Track2026!'

async function openNavigation(page: Page) {
  const menu = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  })
  if (await menu.isVisible()) await menu.click()
}

async function expectAccessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    result.violations.map((violation) => ({
      rule: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        issue: node.failureSummary,
      })),
    })),
  ).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('SP1-1: valid demo login, reload persistence, and sign-out', async ({
  page,
}) => {
  await page.getByLabel('Email address').fill(`  ${demoEmail.toUpperCase()}  `)
  await page.getByLabel('Password', { exact: true }).fill(demoPassword)
  await page.getByLabel('Password', { exact: true }).press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toBeFocused()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toBeVisible()
  // The demo session stores only a flag, never the password.
  expect(
    await page.evaluate(() => Object.values(sessionStorage)),
  ).not.toContain(demoPassword)
  await openNavigation(page)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Welcome back.', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Welcome back.', exact: true }),
  ).toBeFocused()
  await page.reload()
  await expect(page.getByLabel('Email address')).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('')
})

test('SP1-4: empty fields are explained and focus moves to the first error', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Please enter your email address.')).toBeVisible()
  await expect(page.getByText('Please enter your password.')).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeFocused()
  await expect(page.getByLabel('Email address')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await page.getByLabel('Email address').fill(demoEmail)
  await expect(page.getByText('Please enter your password.')).toBeVisible()
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused()
})

test('SP1-4: malformed email is rejected before demo sign-in', async ({
  page,
}) => {
  await page.getByLabel('Email address').fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill(demoPassword)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(
    page.getByText('Please enter a valid email address.'),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toHaveCount(0)
})

test('SP1-4: incorrect credentials keep the user on login with a useful error', async ({
  page,
}) => {
  await page.getByLabel('Email address').fill(demoEmail)
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t sign you in.',
  )
  await expect(page.getByText(demoPassword, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Email address')).toBeVisible()
})

test('SP1-4: password visibility preserves the value and never submits', async ({
  page,
}) => {
  const password = page.getByLabel('Password', { exact: true })
  await password.fill(demoPassword)
  await page.getByRole('button', { name: 'Show password', exact: true }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(password).toHaveValue(demoPassword)
  await page.getByRole('button', { name: 'Hide password', exact: true }).click()
  await expect(password).toHaveAttribute('type', 'password')
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('SP1-5: demo preview and sidebar navigation show the expected views', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Take a look around' }).click()
  await expect(page.getByText('Demo workspace', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'View diary' }).click()
  await expect(
    page.getByRole('heading', { name: 'Your food diary' }),
  ).toBeVisible()
  await expect(page.getByText('1,640 kcal', { exact: true })).toBeVisible()
  await openNavigation(page)
  await page.getByRole('button', { name: 'My goals', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Make space for balance' }),
  ).toBeVisible()
  await expect(
    page.getByText('Demo targets only;', { exact: false }),
  ).toBeVisible()
  await openNavigation(page)
  await page.getByRole('button', { name: 'Food diary', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Your food diary' }),
  ).toBeVisible()
  await openNavigation(page)
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Alex' }),
  ).toBeFocused()
})

test('SP1-5: hydration preview adds glasses and stops at the goal', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Take a look around' }).click()
  const water = page.getByRole('region', { name: 'Stay hydrated' })
  await expect(water).toContainText('1.5')
  await page.getByRole('button', { name: 'Add a glass' }).click()
  await expect(water).toContainText('1.75')
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Add a glass' }).click()
  await expect(water).toContainText('2.5')
  await expect(
    page.getByRole('button', { name: 'Daily goal reached' }),
  ).toBeDisabled()
})

test('SP1-5: login and dashboard fit the viewport', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('login.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Take a look around' }).click()
  await expect(
    page.getByRole('heading', { name: 'Your weekly rhythm' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('dashboard.png'),
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('SP1-5: login and validation meet automated WCAG AA checks', async ({
  page,
}) => {
  await expectAccessible(page)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(2)
  await expectAccessible(page)
})

test('SP1-5: dashboard, diary, goals, and navigation meet automated WCAG AA checks', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Take a look around' }).click()
  await expectAccessible(page)
  await openNavigation(page)
  await expectAccessible(page)
  await page.getByRole('button', { name: 'Food diary', exact: true }).click()
  await expectAccessible(page)
  await openNavigation(page)
  await page.getByRole('button', { name: 'My goals', exact: true }).click()
  await expectAccessible(page)
})
