import { Navbar } from './components/index.js'

function App() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <Navbar />
      <main
        className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-7xl items-center justify-center py-10 sm:min-h-[calc(100svh-9rem)]"
        id="dashboard"
      >
        <section className="glass-surface animate-enter w-full max-w-3xl px-8 py-16 text-center sm:px-16">
          <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-cyan-700 uppercase">
            Student workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            A clearer way to learn and grow.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Your assignment and review space is ready to take shape.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
