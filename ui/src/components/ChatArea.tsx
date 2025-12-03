import { Bubble } from '@ant-design/x'
import { Card, Empty } from 'antd'
import type { FC } from 'react'
import { MessageRole } from '../types'
import { useConfig } from '../hooks'


const ChatArea: FC<{}> = ({ }) => {
  const { messages } = useConfig()
  return (
    <Card
      style={{ flex: 1, minHeight: 0, maxHeight: '100%', overflow: 'auto' }}
      bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      {messages?.length ? (
        <Bubble.List
          items={messages.map(t => {
            return {
              key: t.id,
              role: t.role === MessageRole.USER ? 'user' : 'ai',
              content: t.content,
              typing: t.history ? false : true,
              loading: t.loading
            }
          })}
          autoScroll
          style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '24px' }}
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

