import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { ChatPage } from './pages/chat.page'
import { LoginPage } from './pages/login.page'
import { RegisterPage } from './pages/register.page'

const uniqueUser = () => `u_${randomUUID().replace(/-/g, '').slice(0, 8)}_${Date.now().toString(36)}`

test.describe('authentication', () => {
  test('redirects unauthenticated user from / to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows login form', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()

    await expect(login.heading).toBeVisible()
    await expect(login.usernameInput).toBeVisible()
    await expect(login.passwordInput).toBeVisible()
    await expect(login.submitButton).toBeVisible()
  })

  test('navigates between login and register', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()

    await login.registerLink.click()
    await expect(page).toHaveURL(/\/register/)

    const register = new RegisterPage(page)
    await register.loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('registers a new user and lands on chat', async ({ page }) => {
    const register = new RegisterPage(page)
    await register.goto()

    await register.register(uniqueUser(), 'password123')

    const chat = new ChatPage(page)
    await chat.expectLoaded()
  })

  test('stays on register when username already exists', async ({ page }) => {
    const username = uniqueUser()
    const register = new RegisterPage(page)

    await register.goto()
    await register.register(username, 'password123')
    await expect(page).toHaveURL(/\/chat/)

    // Log out and try registering with the same username.
    const chat = new ChatPage(page)
    await chat.logout()

    await page.goto('/register')
    await register.register(username, 'password123')
    await expect(page).toHaveURL(/\/register/, { timeout: 10_000 })
  })

  test('shows error for invalid credentials on login', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()

    await login.login('nonexistent_user_xyz', 'wrongpassword')
    await expect(login.errorAlert).toBeVisible()
  })

  test('full flow: register, logout, login', async ({ page }) => {
    const username = uniqueUser()
    const password = 'password123'

    // Register
    const register = new RegisterPage(page)
    await register.goto()
    await register.register(username, password)

    const chat = new ChatPage(page)
    await chat.expectLoaded()

    // Logout
    await chat.logout()

    // Login
    const login = new LoginPage(page)
    await login.login(username, password)
    await chat.expectLoaded()
  })
})
