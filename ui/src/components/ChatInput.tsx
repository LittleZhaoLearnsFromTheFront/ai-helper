import { Sender } from '@ant-design/x'
import { Card, message } from 'antd'
import { useState, type FC } from 'react'
import { useConfig } from '../hooks'

interface ChatInputProps {
  onSubmit: (value: string) => Promise<void>
  onAbort: () => void
}

const ChatInput: FC<ChatInputProps> = ({ onSubmit, onAbort }) => {
  const { loading } = useConfig()
  const [value, setValue] = useState<string | undefined>(undefined)
  return (
    <Card>
      <Sender
        value={value}
        onChange={(value) => setValue(value)}
        loading={loading}
        placeholder="请输入问题，按 Enter 发送"
        onSubmit={(value) => {
          if (!value) return message.error('请输入问题')
          setValue(undefined)
          onSubmit(value)
        }}
        autoSize={{ minRows: 2, maxRows: 4 }}
        onCancel={onAbort}
      />
    </Card>
  )
}

export default ChatInput

