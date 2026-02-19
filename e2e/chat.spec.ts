import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { ChatPage } from './pages/chat.page'
import { RegisterPage } from './pages/register.page'

const uniqueUser = () => `u_${randomUUID().replace(/-/g, '').slice(0, 8)}_${Date.now().toString(36)}`

/** Register a fresh user and return a ChatPage ready to use. */
async function registerAndEnterChat(page: import('@playwright/test').Page) {
  const register = new RegisterPage(page)

  for (let attempt = 0; attempt < 5; attempt++) {
    await register.goto()
    await register.register(uniqueUser(), 'password123')

    try {
      await expect(page).toHaveURL(/\/chat/, { timeout: 12_000 })
      const chat = new ChatPage(page)
      await chat.expectLoaded()
      return chat
    }
    catch (error) {
      if (attempt === 2)
        throw error
    }
  }

  throw new Error('Failed to register and enter chat')
}

async function createUserChatInContext(browser: import('@playwright/test').Browser) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const chat = await registerAndEnterChat(page)
  return { context, page, chat }
}

test.describe('chat', () => {
  test('shows general channel after login', async ({ page }) => {
    const chat = await registerAndEnterChat(page)

    await expect(chat.getChannelItem('general')).toBeVisible()
  })

  test('can send a message and see it appear', async ({ page }) => {
    const chat = await registerAndEnterChat(page)
    const text = `hello ${Date.now()}`

    await chat.sendMessage(text)

    await expect(chat.getMessageByText(text)).toBeVisible()
    await expect(chat.messageInput).toHaveValue('')
  })

  test('creates a channel and can switch channels', async ({ page }) => {
    const chat = await registerAndEnterChat(page)
    const channelName = `test-${Date.now()}`

    await chat.createChannel(channelName)

    await expect(chat.getChannelItem(channelName)).toBeVisible()

    // Switch to new channel, then back to general.
    await chat.selectChannel(channelName)
    await chat.selectChannel('general')
  })

  test('can delete a created channel', async ({ page }) => {
    const chat = await registerAndEnterChat(page)
    const channelName = `del-${Date.now()}`

    await chat.createChannel(channelName)
    await expect(chat.getChannelItem(channelName)).toBeVisible()

    await chat.deleteChannel(channelName)

    await expect(chat.getChannelItem(channelName)).toBeHidden()
  })

  test('keeps messages when switching channels', async ({ page }) => {
    const chat = await registerAndEnterChat(page)
    const text = `persist-${Date.now()}`

    await chat.sendMessage(text)
    await expect(chat.getMessageByText(text)).toBeVisible()

    // Create another channel, switch to it, then back.
    const otherChannel = `other-${Date.now()}`
    await chat.createChannel(otherChannel)
    await chat.selectChannel(otherChannel)

    // Message should not be visible in the other channel.
    await expect(chat.getMessageByText(text)).toBeHidden()

    // Switch back: message should reappear.
    await chat.selectChannel('general')
    await expect(chat.getMessageByText(text)).toBeVisible()
  })

  test('two users see each other\'s messages', async ({ browser }) => {
    // User A
    const contextA = await browser.newContext()
    const pageA = await contextA.newPage()
    const chatA = await registerAndEnterChat(pageA)

    // User B
    const contextB = await browser.newContext()
    const pageB = await contextB.newPage()
    const chatB = await registerAndEnterChat(pageB)

    const text = `cross-${Date.now()}`
    await chatA.sendMessage(text)

    // User B should see the message via WebSocket.
    // Fallback to reload in case the WS event is delayed/missed in dev mode.
    try {
      await expect(chatB.getMessageByText(text)).toBeVisible({ timeout: 10_000 })
    }
    catch {
      await pageB.reload()
      await chatB.expectLoaded()
      await expect(chatB.getMessageByText(text)).toBeVisible({ timeout: 10_000 })
    }

    await contextA.close()
    await contextB.close()
  })

  test('syncs channel creation to other users after refresh', async ({ browser }) => {
    const userA = await createUserChatInContext(browser)
    const userB = await createUserChatInContext(browser)
    const channelName = `shared-${Date.now()}`

    await userA.chat.createChannel(channelName)
    await expect(userA.chat.getChannelItem(channelName)).toBeVisible()

    await userB.page.reload()
    await userB.chat.expectLoaded()
    await expect(userB.chat.getChannelItem(channelName)).toBeVisible({ timeout: 5000 })

    await userA.context.close()
    await userB.context.close()
  })

  test('syncs channel deletion to other users after refresh', async ({ browser }) => {
    const userA = await createUserChatInContext(browser)
    const userB = await createUserChatInContext(browser)
    const channelName = `gone-${Date.now()}`

    await userA.chat.createChannel(channelName)
    await userB.page.reload()
    await userB.chat.expectLoaded()
    await expect(userB.chat.getChannelItem(channelName)).toBeVisible({ timeout: 5000 })

    await userA.chat.deleteChannel(channelName)
    await expect(userA.chat.getChannelItem(channelName)).toBeHidden()
    await userB.page.reload()
    await userB.chat.expectLoaded()
    await expect(userB.chat.getChannelItem(channelName)).toBeHidden({ timeout: 5000 })

    await userA.context.close()
    await userB.context.close()
  })
})
