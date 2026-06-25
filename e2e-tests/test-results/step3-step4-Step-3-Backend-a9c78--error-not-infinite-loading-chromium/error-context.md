# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: step3-step4.spec.js >> Step 3: Backend off shows error not infinite loading
- Location: tests\step3-step4.spec.js:129:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  43  |     const err = page.getByText(/invalid|failed|incorrect|credentials|login failed/i)
  44  |     await expect(err.first()).toBeVisible({ timeout: 10_000 })
  45  |     record('Step 3', scenario, 'Error message shown', 'Error visible', 'PASS')
  46  |   } catch (e) {
  47  |     record('Step 3', scenario, 'Show error message', e.message, 'FAIL')
  48  |     throw e
  49  |   }
  50  | })
  51  | 
  52  | test('Step 3: Expired session redirects to login', async ({ page, context }) => {
  53  |   const scenario = 'Expired session'
  54  |   try {
  55  |     await registerAndLogin(page)
  56  |     await context.clearCookies()
  57  |     await page.goto('/workspaces')
  58  |     await expect(page).toHaveURL(/login/, { timeout: 15_000 })
  59  |     record('Step 3', scenario, 'Redirect to /login', 'Redirected', 'PASS')
  60  |   } catch (e) {
  61  |     record('Step 3', scenario, 'Redirect to login', e.message, 'FAIL')
  62  |     throw e
  63  |   }
  64  | })
  65  | 
  66  | test('Step 3: Collaborator blocked from admin workspace settings', async ({ browser }) => {
  67  |   const scenario = 'Collaborator opens admin-only page'
  68  |   const adminContext = await browser.newContext()
  69  |   const collabContext = await browser.newContext()
  70  |   const adminPage = await adminContext.newPage()
  71  |   const collabPage = await collabContext.newPage()
  72  |   try {
  73  |     await registerAndLogin(adminPage)
  74  |     const { workspaceId } = await createWorkspace(adminPage)
  75  | 
  76  |     const collabEmail = `collab_${Date.now()}@taskpulse.test`
  77  |     const collabPassword = 'Test@12345'
  78  |     const reg = await adminPage.request.post('http://localhost:5000/api/auth/register', {
  79  |       data: { name: 'Collab User', email: collabEmail, password: collabPassword },
  80  |     })
  81  |     if (!reg.ok()) {
  82  |       record('Step 3', scenario, 'Blocked or hidden', 'Could not create collaborator user', 'SKIP')
  83  |       test.skip()
  84  |       return
  85  |     }
  86  | 
  87  |     const memberRes = await adminPage.request.post(`http://localhost:5000/api/workspaces/${workspaceId}/members`, {
  88  |       data: { email: collabEmail, role: 'COLLABORATOR', name: 'Collab User' },
  89  |     })
  90  |     if (!memberRes.ok()) {
  91  |       record('Step 3', scenario, 'Blocked or hidden', `Could not add collaborator: ${memberRes.status()}`, 'SKIP')
  92  |       test.skip()
  93  |       return
  94  |     }
  95  | 
  96  |     await collabPage.goto('/login')
  97  |     await collabPage.getByPlaceholder('you@company.com').fill(collabEmail)
  98  |     await collabPage.getByPlaceholder('••••••••').fill(collabPassword)
  99  |     await collabPage.getByRole('button', { name: 'Sign In' }).click()
  100 |     await collabPage.waitForURL('**/workspaces**', { timeout: 15_000 })
  101 | 
  102 |     await collabPage.goto(`/workspaces/${workspaceId}/settings`)
  103 |     const forbidden = collabPage.getByText(/access denied|not authorized|permission|forbidden|only administrators|only workspace administrators/i)
  104 |     const deleteBtn = collabPage.getByRole('button', { name: /delete workspace/i })
  105 |     const saveBtn = collabPage.getByRole('button', { name: /save changes/i })
  106 |     const settingsForm = collabPage.getByRole('heading', { name: /workspace settings/i })
  107 |     const blocked = await forbidden.isVisible().catch(() => false)
  108 |     const deleteHidden = !(await deleteBtn.isVisible().catch(() => false))
  109 |     const formHidden = !(await settingsForm.isVisible().catch(() => false))
  110 |     const saveHidden = !(await saveBtn.isVisible().catch(() => false))
  111 |     if (blocked || (deleteHidden && formHidden)) {
  112 |       record('Step 3', scenario, 'Blocked or hidden', blocked ? 'Access denied message' : 'Admin page hidden', 'PASS')
  113 |     } else if (deleteHidden && !formHidden) {
  114 |       record('Step 3', scenario, 'Blocked or hidden', 'Collaborator can open settings & edit (only delete hidden)', 'FAIL')
  115 |       expect(blocked || formHidden).toBeTruthy()
  116 |     } else {
  117 |       record('Step 3', scenario, 'Blocked or hidden', 'Collaborator sees full admin settings incl. delete', 'FAIL')
  118 |       expect(blocked || deleteHidden).toBeTruthy()
  119 |     }
  120 |   } catch (e) {
  121 |     record('Step 3', scenario, 'Blocked or hidden', e.message, 'FAIL')
  122 |     throw e
  123 |   } finally {
  124 |     await adminContext.close()
  125 |     await collabContext.close()
  126 |   }
  127 | })
  128 | 
  129 | test('Step 3: Backend off shows error not infinite loading', async ({ page }) => {
  130 |   const scenario = 'Network/backend off'
  131 |   try {
  132 |     await registerAndLogin(page)
  133 |     await page.route('**/api/workspaces**', (route) => route.abort('failed'))
  134 |     await page.goto('/workspaces')
  135 |     const spinner = page.getByText(/^loading\.\.\.$/i)
  136 |     await expect(spinner).toBeHidden({ timeout: 15_000 })
  137 |     const hasError = await page.getByText(/failed|error|unable|try again/i).first().isVisible().catch(() => false)
  138 |     const hasEmpty = await page.getByText(/no workspaces|workspace/i).first().isVisible().catch(() => false)
  139 |     if (hasError || hasEmpty) {
  140 |       record('Step 3', scenario, 'Error shown, not infinite loading', hasError ? 'Error message' : 'Fallback UI', 'PASS')
  141 |     } else {
  142 |       record('Step 3', scenario, 'Show error, not infinite loading', 'No clear error or empty state', 'FAIL')
> 143 |       expect(hasError).toBeTruthy()
      |                        ^ Error: expect(received).toBeTruthy()
  144 |     }
  145 |   } catch (e) {
  146 |     record('Step 3', scenario, 'Show error, not infinite loading', e.message, 'FAIL')
  147 |     throw e
  148 |   }
  149 | })
  150 | 
  151 | test('Step 3: Notification API fail keeps list on reopen', async ({ page }) => {
  152 |   const scenario = 'Notification API fails'
  153 |   try {
  154 |     await registerAndLogin(page)
  155 |     let failCount = 0
  156 |     await page.route('**/api/notifications**', (route) => {
  157 |       failCount += 1
  158 |       if (failCount <= 2) {
  159 |         route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Server error' }) })
  160 |       } else {
  161 |         route.continue()
  162 |       }
  163 |     })
  164 |     await page.goto('/workspaces')
  165 |     const bell = page.getByRole('button', { name: 'Notifications' })
  166 |     await bell.click()
  167 |     await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  168 |     await bell.click()
  169 |     await bell.click()
  170 |     await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  171 |     const noNotif = await page.getByText(/no notifications/i).isVisible().catch(() => false)
  172 |     record('Step 3', scenario, 'Popup stays open; list not broken', noNotif ? 'Empty list OK' : 'Popup opens after API fail', 'PASS')
  173 |   } catch (e) {
  174 |     record('Step 3', scenario, 'List should not disappear', e.message, 'FAIL')
  175 |     throw e
  176 |   }
  177 | })
  178 | 
  179 | /* ========== STEP 4: FORM VALIDATION ========== */
  180 | 
  181 | test('Step 4: Login empty email/password', async ({ page }) => {
  182 |   const scenario = 'Login – empty email/password'
  183 |   try {
  184 |     await page.goto('/login')
  185 |     await page.getByRole('button', { name: 'Sign In' }).click()
  186 |     await expect(page.getByText(/email is required|password is required/i).first()).toBeVisible()
  187 |     record('Step 4', scenario, 'Validation error shown', 'Error visible', 'PASS')
  188 |   } catch (e) {
  189 |     record('Step 4', scenario, 'Validation error', e.message, 'FAIL')
  190 |     throw e
  191 |   }
  192 | })
  193 | 
  194 | test('Step 4: Register weak password', async ({ page }) => {
  195 |   const scenario = 'Register – weak password'
  196 |   try {
  197 |     await page.goto('/register')
  198 |     await page.getByPlaceholder(/john doe/i).fill('Test User')
  199 |     await page.getByPlaceholder('you@company.com').fill(`weak_${Date.now()}@test.com`)
  200 |     const pw = page.locator('input[type="password"]')
  201 |     await pw.first().fill('123')
  202 |     await pw.nth(1).fill('123')
  203 |     await page.getByRole('button', { name: /create account|register|sign up/i }).click()
  204 |     await expect(page.getByText(/password|character|uppercase|number|special|at least/i).first()).toBeVisible({ timeout: 8_000 })
  205 |     record('Step 4', scenario, 'Weak password rejected', 'Error shown', 'PASS')
  206 |   } catch (e) {
  207 |     record('Step 4', scenario, 'Weak password error', e.message, 'FAIL')
  208 |     throw e
  209 |   }
  210 | })
  211 | 
  212 | test('Step 4: Register duplicate email', async ({ page }) => {
  213 |   const scenario = 'Register – duplicate email'
  214 |   try {
  215 |     const email = `dup_${Date.now()}@taskpulse.test`
  216 |     const password = 'Test@12345'
  217 |     await page.request.post('http://localhost:5000/api/auth/register', {
  218 |       data: { name: 'Dup Test', email, password },
  219 |     })
  220 |     await page.goto('/register')
  221 |     await page.getByPlaceholder(/john doe/i).fill('Dup Test 2')
  222 |     await page.getByPlaceholder('you@company.com').fill(email)
  223 |     const pw = page.locator('input[type="password"]')
  224 |     await pw.first().fill(password)
  225 |     await pw.nth(1).fill(password)
  226 |     await page.getByRole('button', { name: /create account|register|sign up/i }).click()
  227 |     await expect(page.getByText(/already exists|already registered|duplicate|email/i).first()).toBeVisible({ timeout: 10_000 })
  228 |     record('Step 4', scenario, 'Duplicate email rejected', 'Error shown', 'PASS')
  229 |   } catch (e) {
  230 |     record('Step 4', scenario, 'Duplicate email error', e.message, 'FAIL')
  231 |     throw e
  232 |   }
  233 | })
  234 | 
  235 | test('Step 4: Task form empty title', async ({ page }) => {
  236 |   const scenario = 'Task form – empty title'
  237 |   try {
  238 |     await registerAndLogin(page)
  239 |     const { workspaceId } = await createWorkspace(page)
  240 |     await page.goto(`/workspaces/${workspaceId}`)
  241 |     const btn = page.getByRole('button', { name: /new task|create task/i })
  242 |     await expect(btn.first()).toBeVisible({ timeout: 15_000 })
  243 |     await btn.first().click()
```