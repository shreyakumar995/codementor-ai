import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

function Auth0ProviderWithNavigate({ children }) {
  const navigate = useNavigate()

  const authorizationParams = useMemo(
    () => ({
      redirect_uri: window.location.origin,
      scope: 'openid profile email',
    }),
    [],
  )

  if (!domain || !clientId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="max-w-md rounded-lg border border-red-800 bg-gray-900 p-6 text-sm text-red-300">
          <p className="font-semibold text-red-200">Auth0 is not configured.</p>
          <p className="mt-2">
            Add <code>VITE_AUTH0_DOMAIN</code> and{' '}
            <code>VITE_AUTH0_CLIENT_ID</code> to <code>.env.local</code>, then
            restart <code>npm run dev</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      authorizationParams={authorizationParams}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || '/debug', { replace: true })
      }}
    >
      {children}
    </Auth0Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
