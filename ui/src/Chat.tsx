import { Layout, Space } from "antd";
import ConversationSidebar from "./components/ConversationSidebar";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import CreateConversationModal from "./components/CreateConversationModal";

const Chat = () => {
    return <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
        <Sider width={320} theme="light" style={{ padding: '16px', background: '#f5f6fa' }}>
            <ConversationSidebar
            />
        </Sider>
        <Layout>
            <Content style={{ padding: '24px 32px' }}>
                <Space direction="vertical" size={16} style={{ display: 'flex', height: '100%' }}>
                    {/* <ChatArea messages={currentMessages} /> */}
                    {/* <ChatInput onSubmit={handleSend} /> */}
                </Space>
            </Content>
        </Layout>
        {/* <CreateConversationModal
            open={isModalOpen}
            value={newConversationName}
            error={nameError}
            onChange={(value) => {
                setNewConversationName(value)
                if (nameError) setNameError('')
            }}
            onOk={confirmCreateConversation}
            onCancel={closeCreateModal}
        /> */}
    </Layout>
};
export default Chat;
