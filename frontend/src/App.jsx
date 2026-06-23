import { useAuth0 } from '@auth0/auth0-react'
import Debug from './pages/Debug.jsx'
import Home from './pages/Home.jsx'

function App() {
  const { isLoading, isAuthenticated } = useAuth0()
  console.log('ENV CHECK:', import.meta.env.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_CLIENT_ID)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <Debug /> : <Home />
}

export default App
