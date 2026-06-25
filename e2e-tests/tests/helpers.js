import { expect } from '@playwright/test'

const API = 'http://localhost:5000/api'

export async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}@taskpulse.test`
  const password = 'Test@12345'
  const name = 'E2E Tester'

  const res = await page.request.post(`${API}/auth/register`, {
    data: { name, email, password },
  })
  expect(res.ok()).toBeTruthy()

  await page.goto('/login')
  await page.getByPlaceholder('you@company.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/workspaces**', { timeout: 20_000 })

  return { email, password, name }
}

export async function createWorkspace(page, name = `WS ${Date.now()}`) {
  await page.goto('/workspaces')
  await page.getByRole('button', { name: 'New Workspace' }).click()
  await page.locator('form input.input-field, form input').first().fill(name)
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/workspaces\/[^/]+$/, { timeout: 15_000 })
  const url = page.url()
  const workspaceId = url.split('/workspaces/')[1]
  return { name, workspaceId, url }
}
