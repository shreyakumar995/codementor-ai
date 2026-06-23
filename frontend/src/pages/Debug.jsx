// TODO: Debug page
import { useAuth0 } from '@auth0/auth0-react'

export default function Debug() {
  const { user } = useAuth0()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <img src={user?.picture} alt={user?.name}
          className="w-16 h-16 rounded-full mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
        <p className="text-gray-500 text-sm">{user?.email}</p>
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-6 py-3">
          <p className="text-green-700 font-medium">✓ Day 2 Complete!</p>
          <p className="text-green-600 text-sm mt-1">Auth0 login working perfectly</p>
        </div>
      </div>
    </div>
  )
}