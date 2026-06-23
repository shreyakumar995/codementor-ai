import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function Home() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } =
    useAuth0()
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    console.log('[Auth0] state changed', { isLoading, isAuthenticated, user })
  }, [isLoading, isAuthenticated, user])

  const handleLogin = async () => {
    console.log('[Auth0] login click')
    console.log('[Auth0] loginWithRedirect start')
    setLoginError('')

    try {
      await loginWithRedirect()
      console.log('[Auth0] loginWithRedirect resolved')
    } catch (err) {
      console.error('[Auth0] loginWithRedirect error', err)
      setLoginError(err?.message || String(err) || 'Unknown Auth0 error')
    }
  }

  const handleLogout = () => {
    console.log('[Auth0] logout click')
    console.log('[Auth0] logout start')
    logout({ logoutParams: { returnTo: window.location.origin } })
    console.log('[Auth0] logout called')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
        <img
          src={user.picture}
          alt={user.name}
          className="h-24 w-24 rounded-full"
        />
        <p className="mt-4 text-xl font-bold text-gray-900">{user.name}</p>
        <p className="mt-1 text-gray-500">{user.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    )
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
      {loginError && (
        <p className="mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loginError}
        </p>
      )}
    </div>
  )
}
