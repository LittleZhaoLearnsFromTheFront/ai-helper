import { Empty, Layout } from "antd";
import ConversationSidebar from "./components/ConversationSidebar";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import { ConfigProvider } from "./hooks";
import { MessageRole, type Message, type Session } from "./types";
import { useRef, useState } from "react";
import { useGetState, useRequest } from "ahooks";
import { request } from "./lib/request";


const Chat = () => {
    const [activeSession, setActiveSession] = useState<Session | undefined>(undefined)
    const [_, setMessages, getMessages] = useGetState<Message[] | undefined>([])
    const [loading, setLoading] = useState(false)
    const abortControllerRef = useRef<AbortController | undefined>(undefined)

    useRequest<Message[], any>(async () => {
        const json = await request.get(`/api/ai/sessions/${activeSession?.id}/messages`)
        return json.data
    }, {
        ready: !!activeSession?.id,
        refreshDeps: [activeSession?.id],
        onBefore: () => {
            setMessages([])
        },
        onSuccess(data) {
            setMessages(data.map(t => {
                return {
                    ...t,
                    history: true
                }
            }))
        }
    })

    const onSubmit = async (value: string) => {
        setLoading(true)
        const messageId = MessageRole.USER + '-' + activeSession?.id + '-' + Date.now()
        setMessages([...(getMessages() || []), {
            id: messageId,
            sessionId: activeSession?.id || '',
            role: MessageRole.USER,
            content: value
        }])

        const { sendAIRequest, abortController } = await request.getSSE(activeSession?.id || '', [...(getMessages() || []), {
            role: MessageRole.USER,
            content: value
        }], activeSession?.provider || '', activeSession?.model || '')
        abortControllerRef.current = abortController
        let text = ''
        const aiMessageId = MessageRole.ASSISTANT + '-' + activeSession?.id + '-' + Date.now()
        setMessages([...(getMessages() || []), {
            id: aiMessageId,
            sessionId: activeSession?.id || '',
            role: MessageRole.ASSISTANT,
            content: '',
            loading: true
        }])
        sendAIRequest({
            url: 'http://localhost:4000/api/ai/chat',
            onmessage: (data) => {
                text += data.content;
                setMessages((pre) => {
                    const findAssistantMessage = pre?.find(t => t.id === aiMessageId)
                    if (findAssistantMessage) {
                        findAssistantMessage.content = text
                        findAssistantMessage.loading = false
                    } else {
                        pre?.push({
                            id: aiMessageId,
                            sessionId: activeSession?.id || '',
                            role: MessageRole.ASSISTANT,
                            content: text,
                            loading: false
                        })
                    }
                    return pre
                })
            },
            onerror: () => {
                setLoading(false)
                abortControllerRef.current = undefined
                setMessages((pre) => {
                    const findAssistantMessage = pre?.find(t => t.id === aiMessageId)
                    if (findAssistantMessage) {
                        findAssistantMessage.content = '系统错误'
                    } else {
                        pre?.push({
                            id: aiMessageId,
                            sessionId: activeSession?.id || '',
                            role: MessageRole.ASSISTANT,
                            content: '系统错误'
                        })
                    }
                    return pre
                })
            },
            onclose: () => {
                setLoading(false)
                abortControllerRef.current = undefined
            }
        })
    }

    return <ConfigProvider
        activeSession={activeSession}
        setActiveSession={setActiveSession}
        messages={getMessages()}
        setMessages={setMessages}
        loading={loading}
        setLoading={(loading) => setLoading(loading ?? false)}
    >
        <Layout style={{ height: '100vh', overflow: 'hidden', background: '#f5f6fa' }}>
            <Sider width={320} theme="light" style={{ padding: '16px', background: '#f5f6fa', maxHeight: '100vh', overflow: 'auto' }}>
                <ConversationSidebar />
            </Sider>
            <Layout>
                <Content style={{ padding: '24px 32px' }}>
                    {activeSession?.id ? <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <ChatArea />
                        <ChatInput
                            onAbort={() => {
                                abortControllerRef.current?.abort()
                                abortControllerRef.current = undefined
                                setLoading(false)
                            }}
                            onSubmit={onSubmit}
                        />
                    </div> : <Empty description="当前会话暂无内容" />}
                </Content>
            </Layout>
        </Layout>
    </ConfigProvider>
};
export default Chat;
