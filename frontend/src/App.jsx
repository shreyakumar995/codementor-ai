import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Health check failed')
        return res.json()
      })
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Backend not reachable'))
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-5xl font-bold text-blue-600">CodeMentor AI</h1>
      <p className="mt-2 text-lg text-gray-500">
        AI-powered pair programmer for beginners
      </p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm">
        <p className="text-sm text-gray-700">{apiStatus}</p>
      </div>
    </div>
  )
}

export default App
