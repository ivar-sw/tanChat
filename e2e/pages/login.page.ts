import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LoginPage {
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly registerLink: Locator
  readonly errorAlert: Locator
  readonly heading: Locator

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sign In' })
    this.usernameInput = page.getByLabel('Username')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign In' })
    this.registerLink = page.getByRole('link', { name: /Register/ })
    this.errorAlert = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
    await expect(this.heading).toBeVisible()
    await expect(this.usernameInput).toBeEditable()
    await expect(this.passwordInput).toBeEditable()
  }

  async login(username: string, password: string) {
    await expect(this.usernameInput).toBeEditable()
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
