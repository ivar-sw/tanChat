import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ChatPage {
  readonly messageInput: Locator
  readonly sendButton: Locator
  readonly logoutButton: Locator
  readonly newChannelButton: Locator
  readonly channelList: Locator

  constructor(private page: Page) {
    this.messageInput = page.getByPlaceholder('Type a message...')
    this.sendButton = page.getByRole('button', { name: '➤' })
    this.logoutButton = page.getByRole('button', { name: 'Log out' })
    this.newChannelButton = page.getByRole('button', { name: '+ New channel' })
    this.channelList = page.getByRole('list')
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/chat/, { timeout: 15_000 })
    await expect(this.page.getByText('TanChat')).toBeVisible({ timeout: 15_000 })
  }

  async sendMessage(content: string) {
    await this.messageInput.fill(content)
    await this.sendButton.click()
  }

  async selectChannel(name: string) {
    await this.channelList.getByText(name).click()
  }

  async createChannel(name: string) {
    await this.newChannelButton.click()
    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Channel name').fill(name)
    await dialog.getByRole('button', { name: 'Create' }).click()
    await expect(dialog).toBeHidden()
  }

  async deleteChannel(name: string) {
    const channelItem = this.channelList
      .getByRole('button')
      .filter({ hasText: name })
    await channelItem.hover()
    await channelItem.getByLabel('delete channel').click()
    const dialog = this.page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Delete' }).click()
    await expect(dialog).toBeHidden()
  }

  async logout() {
    await this.logoutButton.click()
    await expect(this.page).toHaveURL(/\/login/)
  }

  getMessages() {
    return this.page.locator('[class*="MuiStack-root"]').filter({
      has: this.page.locator('p'),
    })
  }

  getMessageByText(text: string) {
    return this.page.getByText(text)
  }

  getChannelItem(name: string) {
    return this.channelList.getByText(name)
  }
}
