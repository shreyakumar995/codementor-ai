import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../lib/api'

const LANGUAGE_COLORS = {
  python: 'border-yellow-600/50 bg-yellow-600/20 text-yellow-300',
  javascript: 'border-amber-600/50 bg-amber-600/20 text-amber-300',
  java: 'border-orange-600/50 bg-orange-600/20 text-orange-300',
  cpp: 'border-purple-600/50 bg-purple-600/20 text-purple-300',
}

function getLanguageColor(language) {
  return (
    LANGUAGE_COLORS[language?.toLowerCase()] ||
    'border-gray-600/50 bg-gray-700/40 text-gray-300'
  )
}

function formatDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getCodePreview(code) {
  const firstLine = (code || '').split('\n')[0].trim()
  if (!firstLine) return 'No code snippet'
  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}...` : firstLine
}

function getQuizLabel(session) {
  if (!session.quiz_completed) return 'Quiz not taken'
  const total = session.quiz?.length || 0
  return total > 0
    ? `Quiz: ${session.quiz_score}/${total}`
    : `Quiz: ${session.quiz_score}`
}

export default function History() {
  const { user, logout } = useAuth0()
  const { authFetch } = useApi()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true)
      setError('')

      try {
        const response = await authFetch('/api/sessions')
        const data = await response.json()
        setSessions(data.sessions || [])
      } catch (err) {
        setError(err.message || 'Failed to load session history')
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [authFetch])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-500">CodeMentor AI</h1>
            <Link
              to="/debug"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Debug
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Dashboard
            </Link>
          </div>
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-100">
          Session History
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
              <span>Loading your sessions...</span>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-lg font-medium text-gray-200">No sessions yet</p>
            <p className="mt-2 text-sm text-gray-400">
              Debug some code and your history will show up here.
            </p>
            <Link
              to="/debug"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Debug
            </Link>
          </div>
        )}

        {!isLoading && !error && sessions.length > 0 && (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <article
                key={session._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getLanguageColor(session.language)}`}
                  >
                    {session.language || 'unknown'}
                  </span>
                  <span className="rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300">
                    {session.bug_type || 'GeneralError'}
                  </span>
                </div>

                <p className="font-mono text-sm text-gray-300">
                  {getCodePreview(session.original_code)}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400">
                  <span>{formatDate(session.created_at)}</span>
                  <span
                    className={
                      session.quiz_completed
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }
                  >
                    {getQuizLabel(session)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
