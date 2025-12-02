import { useEffect, useState } from 'react'
import '@ant-design/x/es/style'
import 'antd/dist/reset.css'
import Chat from './Chat'
import { Spin } from 'antd'
import { request } from './lib/request'


function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type !== 'set-user') return
      setLoading(false)
      request.setUser(event.data.user)
    })
  }, [])

  if (!loading) {
    return <Spin tip='正在初始化...'><div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div></Spin>
  }

  return (
    <Chat />
  )
}

export default App
