import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import Editor from '../components/Editor'
import ExplainPanel from '../components/ExplainPanel'

export default function Debug() {
  const { user, logout } = useAuth0()
  const [code, setCode] = useState('# Paste your broken code here')
  const [language, setLanguage] = useState('python')
  const [errorMessage, setErrorMessage] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDebug = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    setExplanation('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/debug`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            language,
            error_message: errorMessage,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Request failed: ${response.status}`)
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (err) {
      setExplanation(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-blue-500">CodeMentor AI</h1>
          <div className="flex items-center gap-3">
            <img
              src={user?.picture}
              alt={user?.name || 'User profile'}
              className="h-10 w-10 rounded-full"
            />
            <span className="hidden text-sm font-medium text-gray-200 sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 text-xl font-semibold text-gray-100">
            Paste your broken code
          </h2>

          <Editor
            value={code}
            onChange={(newValue) => setCode(newValue ?? '')}
            language={language}
            onLanguageChange={setLanguage}
          />

          <div className="mt-4">
            <label
              htmlFor="error-message"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Error message (optional)
            </label>
            <textarea
              id="error-message"
              value={errorMessage}
              onChange={(event) => setErrorMessage(event.target.value)}
              placeholder="Paste traceback or compiler error here"
              rows={4}
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleDebug}
            disabled={isLoading}
            className="mt-4 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading ? 'Debugging...' : 'Debug with AI'}
          </button>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 text-xl font-semibold text-gray-100">
            AI explanation
          </h2>
          <ExplainPanel explanation={explanation} isLoading={isLoading} />
        </section>
      </main>
    </div>
  )
}