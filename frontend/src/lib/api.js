import { useAuth0 } from '@auth0/auth0-react'

const API_URL = import.meta.env.VITE_API_URL || ''

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()

  async function authFetch(url, options = {}) {
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE

    let token
    try {
      token = await getAccessTokenSilently({
        authorizationParams: { audience },
      })
    } catch (err) {
      throw new Error(
        err?.message?.includes('access_denied') ||
          err?.message?.includes('not authorized')
          ? 'Your Auth0 app is not authorized for the API. In Auth0 Dashboard, open APIs → codementor-api → Application Access and authorize your SPA.'
          : err?.message || 'Failed to get access token',
      )
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    return response
  }

  return { authFetch }
}
