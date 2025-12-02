import { Sender } from '@ant-design/x'
import { Card } from 'antd'
import type { FC } from 'react'

interface ChatInputProps {
  onSubmit: (value?: string) => void
}

const ChatInput: FC<ChatInputProps> = ({ onSubmit }) => {
  return (
    <Card>
      <Sender placeholder="请输入问题，按 Enter 发送" onSubmit={onSubmit} autoSize={{ minRows: 2, maxRows: 4 }} />
    </Card>
  )
}

export default ChatInput

