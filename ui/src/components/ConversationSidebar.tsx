import type { ConversationItemType } from '@ant-design/x'
import { Conversations } from '@ant-design/x'
import { useRequest } from 'ahooks'
import { Button, Card, Typography } from 'antd'
import type { FC } from 'react'


const MAX_CONVERSATIONS = 10

const ConversationSidebar: FC<{}> = () => {

useRequest(async()=>{
    
})

    const isMaxConversations = conversations.length >= MAX_CONVERSATIONS

    return (
        <Card
            bordered={false}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
            }}
            bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <Typography.Title level={5} style={{ marginBottom: 12 }}>
                会话列表
            </Typography.Title>
            <Conversations
                items={conversations}
                activeKey={activeKey}
                onActiveChange={onActiveChange}
                style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}
            />
            <Button type="primary" block onClick={onCreate} disabled={isMaxConversations} style={{ marginBottom: 12 }}>
                {isMaxConversations ? `会话上限(${maxCount})` : '新建会话'}
            </Button>
            <Typography.Text type="secondary">
                当前会话：{conversations.length}/{maxCount}
            </Typography.Text>
        </Card>
    )
}

export default ConversationSidebar

