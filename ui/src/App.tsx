import { useEffect, useState } from 'react'
import '@ant-design/x/es/style'
import 'antd/dist/reset.css'
import Chat from './Chat'
import { Spin } from 'antd'
import { request } from './lib/request'


function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 监听来自父窗口的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'set-user') {
        setLoading(false)
        request.setUser(event.data.user)
      }
    }

    window.addEventListener('message', handleMessage)

    // 通知父窗口应用已准备好接收消息
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ready' }, '*')
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  if (loading) {
    return <Spin tip='正在初始化...'><div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div></Spin>
  }

  return (
    <Chat />
  )
}

export default App
