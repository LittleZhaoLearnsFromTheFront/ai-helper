import type { BubbleItemType } from '@ant-design/x'
import { Bubble } from '@ant-design/x'
import { Card, Empty } from 'antd'
import type { FC } from 'react'

interface ChatAreaProps {
  messages: BubbleItemType[]
}

const ChatArea: FC<ChatAreaProps> = ({ messages }) => {
  return (
    <Card
      style={{ flex: 1, minHeight: 0 }}
      bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      {messages.length ? (
        <Bubble.List
          items={messages}
          autoScroll
          style={{ flex: 1, overflow: 'auto', padding: '24px' }}
          role={{
            user: {
              placement: 'end',
              variant: 'shadow',
            },
            ai: {
              placement: 'start',
              variant: 'outlined',
            },
          }}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="当前会话暂无内容" />
        </div>
      )}
    </Card>
  )
}

export default ChatArea

