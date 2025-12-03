import { useBoolean } from 'ahooks'
import { Button, Form, Input, Modal, Typography, type FormProps } from 'antd'
import type { FC } from 'react'
import { MAX_CONVERSATIONS } from '../constants'
import { request } from '../lib/request'
import ProviderSelect from './ProviderSelect'

interface CreateConversationModalProps {
  onSuccess: () => void
  isMaxConversations: boolean
}

const CreateConversationModal: FC<CreateConversationModalProps> = ({
  onSuccess,
  isMaxConversations,
}) => {
  const [open, { setFalse: hide, setTrue: show }] = useBoolean()
  const [form] = Form.useForm<{ title: string }>()

  const onOk: FormProps<{ title: string }>['onFinish'] = async (values) => {
    await request.post('/api/ai/sessions', values)
    onSuccess()
    hide()
  }

  return (
    <>
      <Button type="primary" onClick={show} disabled={isMaxConversations} style={{ marginBottom: 12 }}>
        {isMaxConversations ? `会话上限(${MAX_CONVERSATIONS})` : '新建会话'}
      </Button>
      <Modal
        title="新建会话"
        open={open}
        okText="确认创建"
        cancelText="取消"
        onOk={() => form.submit()}
        onCancel={hide}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={onOk} form={form} preserve={false}>
          <Form.Item
            label="会话名称"
            name="title"
            rules={[{ required: true, message: '请输入便于识别的会话标题' }]}
          >
            <Input
              onPressEnter={(event) => {
                event.preventDefault()
                form.submit()
              }}
              placeholder="例如：新品发布策划"
            />
          </Form.Item>
          <Form.Item
            label='会话模型'
            name='provider'
            rules={[{ required: true, message: '请选择会话模型' }]}
          >
            <ProviderSelect />
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">Enter 提交，Esc 或取消按钮关闭</Typography.Text>
      </Modal>
    </>
  )
}

export default CreateConversationModal

