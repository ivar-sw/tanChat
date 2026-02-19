import { SystemMessage } from '~/components'

interface Props {
  typingUsers: string[]
}

export const TypingIndicator = ({ typingUsers }: Props) => {
  if (typingUsers.length === 0)
    return null

  return <SystemMessage align="left" highlight content={`${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`} />
}
