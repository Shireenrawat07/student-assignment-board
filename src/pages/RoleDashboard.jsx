import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/index.js'
import { useAuth } from '../auth/useAuth.js'

function RoleDashboard({ role }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const roleLabel = role === 'admin' ? 'Admin' : 'Student'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <Navbar
        userName={currentUser.name}
        userRole={roleLabel}
        role={role}
        onLogout={handleLogout}
      />
      <main className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-7xl items-center justify-center py-10 sm:min-h-[calc(100svh-9rem)]">
        <section className="glass-surface animate-enter w-full max-w-3xl px-8 py-14 text-center sm:px-16">
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-cyan-800 uppercase">
            {roleLabel} workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Welcome, {currentUser.name}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
            Your {roleLabel.toLowerCase()} area is ready. Dashboard features will be added in a later stage.
          </p>
        </section>
      </main>
    </div>
  )
}

export default RoleDashboard
