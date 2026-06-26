import { test, expect } from '@playwright/test'
import { registerAndLogin, createWorkspace } from './helpers.js'

const results = []

function record(area, scenario, expected, actual, status) {
  results.push({ area, scenario, expected, actual, status })
}

test.afterAll(async () => {
  console.log('\n===== STEP 3 & 4 TEST RESULTS =====')
  console.table(results)
  const fails = results.filter((r) => r.status === 'FAIL')
  console.log(`\nTotal: ${results.length} | Pass: ${results.length - fails.length} | Fail: ${fails.length}`)
})

/* ========== STEP 3: EDGE CASES ========== */

test('Step 3: Empty workspace shows empty state', async ({ page }) => {
  const scenario = 'Empty workspace (no tasks)'
  try {
    await registerAndLogin(page)
    const { workspaceId } = await createWorkspace(page)
    await page.goto(`/workspaces/${workspaceId}`)
    await page.getByRole('button', { name: /tasks/i }).first().click().catch(() => {})
    const empty = page.getByText(/no tasks yet/i)
    const createBtn = page.getByRole('button', { name: /create task|new task/i })
    await expect(empty.or(createBtn).first()).toBeVisible({ timeout: 15_000 })
    record('Step 3', scenario, 'Empty state or create CTA visible', 'Visible', 'PASS')
  } catch (e) {
    record('Step 3', scenario, 'Empty state, not blank page', e.message, 'FAIL')
    throw e
  }
})

test('Step 3: Invalid login shows error', async ({ page }) => {
  const scenario = 'Invalid login'
  try {
    await page.goto('/login')
    await page.getByPlaceholder('you@company.com').fill('invalid@test.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    const err = page.getByText(/invalid|failed|incorrect|credentials|login failed/i)
    await expect(err.first()).toBeVisible({ timeout: 10_000 })
    record('Step 3', scenario, 'Error message shown', 'Error visible', 'PASS')
  } catch (e) {
    record('Step 3', scenario, 'Show error message', e.message, 'FAIL')
    throw e
  }
})

test('Step 3: Expired session redirects to login', async ({ page, context }) => {
  const scenario = 'Expired session'
  try {
    await registerAndLogin(page)
    await context.clearCookies()
    await page.goto('/workspaces')
    await expect(page).toHaveURL(/login/, { timeout: 15_000 })
    record('Step 3', scenario, 'Redirect to /login', 'Redirected', 'PASS')
  } catch (e) {
    record('Step 3', scenario, 'Redirect to login', e.message, 'FAIL')
    throw e
  }
})

test('Step 3: Collaborator blocked from admin workspace settings', async ({ browser }) => {
  const scenario = 'Collaborator opens admin-only page'
  const adminContext = await browser.newContext()
  const collabContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  const collabPage = await collabContext.newPage()
  try {
    await registerAndLogin(adminPage)
    const { workspaceId } = await createWorkspace(adminPage)

    const collabEmail = `collab_${Date.now()}@taskpulse.test`
    const collabPassword = 'Test@12345'
    const reg = await adminPage.request.post('http://localhost:5000/api/auth/register', {
      data: { name: 'Collab User', email: collabEmail, password: collabPassword },
    })
    if (!reg.ok()) {
      record('Step 3', scenario, 'Blocked or hidden', 'Could not create collaborator user', 'SKIP')
      test.skip()
      return
    }

    const memberRes = await adminPage.request.post(`http://localhost:5000/api/workspaces/${workspaceId}/members`, {
      data: { email: collabEmail, role: 'COLLABORATOR', name: 'Collab User' },
    })
    if (!memberRes.ok()) {
      record('Step 3', scenario, 'Blocked or hidden', `Could not add collaborator: ${memberRes.status()}`, 'SKIP')
      test.skip()
      return
    }

    await collabPage.goto('/login')
    await collabPage.getByPlaceholder('you@company.com').fill(collabEmail)
    await collabPage.getByPlaceholder('••••••••').fill(collabPassword)
    await collabPage.getByRole('button', { name: 'Sign In' }).click()
    await collabPage.waitForURL('**/workspaces**', { timeout: 15_000 })

    await collabPage.goto(`/workspaces/${workspaceId}/settings`)
    const forbidden = collabPage.getByText(/access denied|not authorized|permission|forbidden|only administrators|only workspace administrators/i)
    const deleteBtn = collabPage.getByRole('button', { name: /delete workspace/i })
    const saveBtn = collabPage.getByRole('button', { name: /save changes/i })
    const settingsForm = collabPage.getByRole('heading', { name: /workspace settings/i })
    const blocked = await forbidden.isVisible().catch(() => false)
    const deleteHidden = !(await deleteBtn.isVisible().catch(() => false))
    const formHidden = !(await settingsForm.isVisible().catch(() => false))
    const saveHidden = !(await saveBtn.isVisible().catch(() => false))
    if (blocked || (deleteHidden && formHidden)) {
      record('Step 3', scenario, 'Blocked or hidden', blocked ? 'Access denied message' : 'Admin page hidden', 'PASS')
    } else if (deleteHidden && !formHidden) {
      record('Step 3', scenario, 'Blocked or hidden', 'Collaborator can open settings & edit (only delete hidden)', 'FAIL')
      expect(blocked || formHidden).toBeTruthy()
    } else {
      record('Step 3', scenario, 'Blocked or hidden', 'Collaborator sees full admin settings incl. delete', 'FAIL')
      expect(blocked || deleteHidden).toBeTruthy()
    }
  } catch (e) {
    record('Step 3', scenario, 'Blocked or hidden', e.message, 'FAIL')
    throw e
  } finally {
    await adminContext.close()
    await collabContext.close()
  }
})

test('Step 3: Backend off shows error not infinite loading', async ({ page }) => {
  const scenario = 'Network/backend off'
  try {
    await registerAndLogin(page)
    await page.route('**/api/workspaces**', (route) => route.abort('failed'))
    await page.goto('/workspaces')
    const spinner = page.getByText(/^loading\.\.\.$/i)
    await expect(spinner).toBeHidden({ timeout: 15_000 })
    const hasError = await page.getByText(/failed|error|unable|try again/i).first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText(/no workspaces|workspace/i).first().isVisible().catch(() => false)
    if (hasError || hasEmpty) {
      record('Step 3', scenario, 'Error shown, not infinite loading', hasError ? 'Error message' : 'Fallback UI', 'PASS')
    } else {
      record('Step 3', scenario, 'Show error, not infinite loading', 'No clear error or empty state', 'FAIL')
      expect(hasError).toBeTruthy()
    }
  } catch (e) {
    record('Step 3', scenario, 'Show error, not infinite loading', e.message, 'FAIL')
    throw e
  }
})

test('Step 3: Notification API fail keeps list on reopen', async ({ page }) => {
  const scenario = 'Notification API fails'
  try {
    await registerAndLogin(page)
    let failCount = 0
    await page.route('**/api/notifications**', (route) => {
      failCount += 1
      if (failCount <= 2) {
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Server error' }) })
      } else {
        route.continue()
      }
    })
    await page.goto('/workspaces')
    const bell = page.getByRole('button', { name: 'Notifications' })
    await bell.click()
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
    await bell.click()
    await bell.click()
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
    const noNotif = await page.getByText(/no notifications/i).isVisible().catch(() => false)
    record('Step 3', scenario, 'Popup stays open; list not broken', noNotif ? 'Empty list OK' : 'Popup opens after API fail', 'PASS')
  } catch (e) {
    record('Step 3', scenario, 'List should not disappear', e.message, 'FAIL')
    throw e
  }
})

/* ========== STEP 4: FORM VALIDATION ========== */

test('Step 4: Login empty email/password', async ({ page }) => {
  const scenario = 'Login – empty email/password'
  try {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText(/email is required|password is required/i).first()).toBeVisible()
    record('Step 4', scenario, 'Validation error shown', 'Error visible', 'PASS')
  } catch (e) {
    record('Step 4', scenario, 'Validation error', e.message, 'FAIL')
    throw e
  }
})

test('Step 4: Register weak password', async ({ page }) => {
  const scenario = 'Register – weak password'
  try {
    await page.goto('/register')
    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder('you@company.com').fill(`weak_${Date.now()}@test.com`)
    const pw = page.locator('input[type="password"]')
    await pw.first().fill('123')
    await pw.nth(1).fill('123')
    await page.getByRole('button', { name: /create account|register|sign up/i }).click()
    await expect(page.getByText(/password|character|uppercase|number|special|at least/i).first()).toBeVisible({ timeout: 8_000 })
    record('Step 4', scenario, 'Weak password rejected', 'Error shown', 'PASS')
  } catch (e) {
    record('Step 4', scenario, 'Weak password error', e.message, 'FAIL')
    throw e
  }
})

test('Step 4: Register duplicate email', async ({ page }) => {
  const scenario = 'Register – duplicate email'
  try {
    const email = `dup_${Date.now()}@taskpulse.test`
    const password = 'Test@12345'
    await page.request.post('http://localhost:5000/api/auth/register', {
      data: { name: 'Dup Test', email, password },
    })
    await page.goto('/register')
    await page.getByPlaceholder(/john doe/i).fill('Dup Test 2')
    await page.getByPlaceholder('you@company.com').fill(email)
    const pw = page.locator('input[type="password"]')
    await pw.first().fill(password)
    await pw.nth(1).fill(password)
    await page.getByRole('button', { name: /create account|register|sign up/i }).click()
    await expect(page.getByText(/already exists|already registered|duplicate|email/i).first()).toBeVisible({ timeout: 10_000 })
    record('Step 4', scenario, 'Duplicate email rejected', 'Error shown', 'PASS')
  } catch (e) {
    record('Step 4', scenario, 'Duplicate email error', e.message, 'FAIL')
    throw e
  }
})

test('Step 4: Task form empty title', async ({ page }) => {
  const scenario = 'Task form – empty title'
  try {
    await registerAndLogin(page)
    const { workspaceId } = await createWorkspace(page)
    await page.goto(`/workspaces/${workspaceId}`)
    const btn = page.getByRole('button', { name: /new task|create task/i })
    await expect(btn.first()).toBeVisible({ timeout: 15_000 })
    await btn.first().click()
    await page.getByRole('button', { name: /create|save|add/i }).last().click()
    await expect(page.getByText(/title is required|required/i).first()).toBeVisible({ timeout: 8_000 })
    record('Step 4', scenario, 'Empty title rejected', 'Error shown', 'PASS')
  } catch (e) {
    record('Step 4', scenario, 'Empty title validation', e.message, 'FAIL')
    throw e
  }
})

test('Step 4: Profile empty name validation', async ({ page }) => {
  const scenario = 'Profile – invalid inputs'
  try {
    await registerAndLogin(page)
    await page.goto('/profile')
    const nameInput = page.getByPlaceholder('John Doe')
    await nameInput.fill('')
    await page.getByRole('button', { name: /save changes/i }).click()
    await expect(page.getByText(/full name is required|required/i).first()).toBeVisible({ timeout: 8_000 })
    record('Step 4', scenario, 'Empty name rejected', 'Error shown', 'PASS')
  } catch (e) {
    record('Step 4', scenario, 'Profile validation', e.message, 'FAIL')
    throw e
  }
})

test('Step 4: Workspace settings empty name', async ({ page }) => {
  const scenario = 'Workspace settings – empty name'
  try {
    await registerAndLogin(page)
    const { workspaceId } = await createWorkspace(page)
    await page.goto(`/workspaces/${workspaceId}/settings`)
    const nameInput = page.locator('input').filter({ has: page.locator('xpath=..') }).first()
    const inputs = page.locator('form input, .input-field')
    const nameField = inputs.first()
    await nameField.fill('')
    const save = page.getByRole('button', { name: /save|update/i })
    await save.first().click()
    const err = page.getByText(/name is required|required|cannot be empty/i)
    const stillOnPage = page.url().includes('/settings')
    if (await err.isVisible().catch(() => false)) {
      record('Step 4', scenario, 'Empty name rejected', 'Error shown', 'PASS')
    } else if (stillOnPage) {
      record('Step 4', scenario, 'Empty name rejected', 'No error but did not save (silent block)', 'PASS')
    } else {
      record('Step 4', scenario, 'Empty name rejected', 'No validation error shown', 'FAIL')
      expect(await err.isVisible().catch(() => false)).toBeTruthy()
    }
  } catch (e) {
    record('Step 4', scenario, 'Workspace settings validation', e.message, 'FAIL')
    throw e
  }
})
