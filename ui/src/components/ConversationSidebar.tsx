import { Conversations } from '@ant-design/x'
import { useRequest } from 'ahooks'
import { Card, Spin, Typography } from 'antd'
import type { FC } from 'react'
import { request } from '../lib/request'
import type { Session } from '../types'
import { useConfig } from '../hooks'
import { MAX_CONVERSATIONS } from '../constants'
import CreateConversationModal from './CreateConversation'
import { DeleteOutlined } from '@ant-design/icons'


const ConversationSidebar: FC<{}> = () => {
    const { activeSession, setActiveSession } = useConfig()
    const { data: conversations, refresh, loading } = useRequest<Session[], any>(async () => {
        const json = await request.get('/api/ai/sessions')
        return json.data
    }, {
        onSuccess(data) {
            if (!data.length) {
                setActiveSession?.(undefined)
                return
            }
            if (activeSession && data.some(session => session.id === activeSession.id)) return
            setActiveSession?.(data[0] ?? undefined)
        }
    })

    const isMaxConversations = (conversations?.length || 0) >= MAX_CONVERSATIONS

    return (
        loading ? <Spin /> : <Card
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
                items={conversations?.map(conversation => ({
                    key: conversation.id,
                    label: conversation.title,
                    group: conversation.provider,

                }))}
                activeKey={activeSession?.id}
                onActiveChange={(value) => {
                    const session = conversations?.find(session => session.id === value)
                    if (!session) return
                    setActiveSession?.(session)
                }}
                style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}
                menu={(conversationItem) => ({
                    items: [
                        {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '删除',
                        }
                    ],
                    onClick: async () => {
                        // conversationItem.key 是会话的 ID
                        const sessionId = conversationItem.key
                        await request.delete(`/api/ai/sessions/${sessionId}`)
                        refresh()
                    }
                })}
            />
            <CreateConversationModal
                isMaxConversations={isMaxConversations}
                onSuccess={refresh}
            />

            <Typography.Text type="secondary">
                当前会话：{conversations?.length || 0}/{MAX_CONVERSATIONS}
            </Typography.Text>
        </Card>
    )
}

export default ConversationSidebar

