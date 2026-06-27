import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'

export default function Home() {
  const { isLoading, isAuthenticated, loginWithRedirect, error } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/debug' },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/debug" replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <h1 className="text-5xl font-bold text-blue-600">CodeMentor AI</h1>
      <p className="mt-4 max-w-md text-lg text-gray-500">
        Your AI-powered pair programmer for beginners. Paste your code, get
        plain-English explanations, debug help, and quizzes — all in one place.
      </p>
      <button
        type="button"
        onClick={handleLogin}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
      >
        Get started — it's free
      </button>
      {error && (
        <p className="mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Auth0 error: {error.message}
        </p>
      )}
    </div>
  )
}
