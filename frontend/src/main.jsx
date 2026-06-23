import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

console.log('[Auth0] provider init start', {
  domain,
  clientIdPresent: Boolean(clientId),
  redirectUri: window.location.origin,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        
        scope: 'openid profile email',
      }}
      onRedirectCallback={(appState) => {
        console.log('[Auth0] redirect callback', appState)
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
