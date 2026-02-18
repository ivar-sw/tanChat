import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class RegisterPage {
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly loginLink: Locator
  readonly errorAlert: Locator
  readonly heading: Locator

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: 'Create Account' })
    this.usernameInput = page.getByLabel('Username')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Create Account' })
    this.loginLink = page.getByRole('link', { name: /Sign In/ })
    this.errorAlert = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/register')
    await expect(this.heading).toBeVisible()
    await expect(this.usernameInput).toBeEditable()
    await expect(this.passwordInput).toBeEditable()
  }

  async register(username: string, password: string) {
    await expect(this.usernameInput).toBeEditable()
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
