import { Form, Input, Modal, Typography } from 'antd'
import type { FC } from 'react'

interface CreateConversationModalProps {
  open: boolean
  value: string
  error?: string
  onChange: (value: string) => void
  onOk: () => void
  onCancel: () => void
}

const CreateConversationModal: FC<CreateConversationModalProps> = ({
  open,
  value,
  error,
  onChange,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title="新建会话"
      open={open}
      okText="确认创建"
      cancelText="取消"
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item
          label="会话名称"
          validateStatus={error ? 'error' : ''}
          help={error || '请输入便于识别的会话标题'}
        >
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onPressEnter={(event) => {
              event.preventDefault()
              onOk()
            }}
            placeholder="例如：新品发布策划"
          />
        </Form.Item>
      </Form>
      <Typography.Text type="secondary">Enter 提交，Esc 或取消按钮关闭</Typography.Text>
    </Modal>
  )
}

export default CreateConversationModal

