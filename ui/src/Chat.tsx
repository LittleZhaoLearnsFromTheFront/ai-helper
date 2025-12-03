import { Layout, Space } from "antd";
import ConversationSidebar from "./components/ConversationSidebar";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import { ConfigProvider } from "./hooks";
import type { Session } from "./types";
import { useState } from "react";

const Chat = () => {
    const [activeSession, setActiveSession] = useState<Session | undefined>(undefined)

    return <ConfigProvider
        activeSession={activeSession}
        setActiveSession={setActiveSession}
    >
        <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
            <Sider width={320} theme="light" style={{ padding: '16px', background: '#f5f6fa' }}>
                <ConversationSidebar />
            </Sider>
            <Layout>
                <Content style={{ padding: '24px 32px' }}>
                    <Space direction="vertical" size={16} style={{ display: 'flex', height: '100%' }}>
                        {/* <ChatArea messages={currentMessages} /> */}
                        {/* <ChatInput onSubmit={handleSend} /> */}
                    </Space>
                </Content>
            </Layout>
        </Layout>
    </ConfigProvider>
};
export default Chat;
