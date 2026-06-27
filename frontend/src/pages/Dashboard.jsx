import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApi } from '../lib/api'

function buildLastSevenDays(daily) {
  const countsByDate = Object.fromEntries(
    (daily || []).map((entry) => [entry.date, entry.bugs]),
  )

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return {
      date: key,
      bugs: countsByDate[key] || 0,
    }
  })
}

export default function Dashboard() {
  const { user, logout } = useAuth0()
  const { authFetch } = useApi()
  const [progress, setProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true)
      setError('')

      try {
        const response = await authFetch('/api/progress')
        const data = await response.json()
        setProgress(data)
      } catch (err) {
        setError(err.message || 'Failed to load progress')
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [authFetch])

  const dailyData = useMemo(
    () => buildLastSevenDays(progress?.daily),
    [progress?.daily],
  )

  const chartStyles = {
    grid: '#374151',
    axis: '#9CA3AF',
    tooltipBg: '#111827',
    tooltipBorder: '#374151',
  }

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
              to="/history"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              History
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
        <h2 className="mb-6 text-2xl font-semibold text-gray-100">Dashboard</h2>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
            <span className="ml-3">Loading progress...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && progress && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <p className="text-sm text-gray-400">Total sessions</p>
                <p className="mt-2 text-3xl font-bold text-gray-100">
                  {progress.total_sessions}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <p className="text-sm text-gray-400">Avg quiz score</p>
                <p className="mt-2 text-3xl font-bold text-gray-100">
                  {progress.avg_quiz_score}
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-gray-100">
                Bugs per day (last 7 days)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid stroke={chartStyles.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} />
                    <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartStyles.tooltipBg,
                        border: `1px solid ${chartStyles.tooltipBorder}`,
                        borderRadius: '0.5rem',
                        color: '#F3F4F6',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bugs"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-gray-100">
                Bug types
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progress.bug_types || []}>
                    <CartesianGrid stroke={chartStyles.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="type" stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} />
                    <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartStyles.tooltipBg,
                        border: `1px solid ${chartStyles.tooltipBorder}`,
                        borderRadius: '0.5rem',
                        color: '#F3F4F6',
                      }}
                    />
                    <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
