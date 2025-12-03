import { useEffect, useRef } from 'react'

function App() {

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    window?.addEventListener('message', (event) => {
      if (event.data.type === 'ready') {
        iframeRef.current?.contentWindow?.postMessage({ type: 'set-user', user: '123' }, '*')
      }
    })
  }, [])

  return (
    <>
      <iframe
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
        }}
        src="http://localhost:5173"
        ref={iframeRef}
      ></iframe>
    </>
  )
}

export default App
