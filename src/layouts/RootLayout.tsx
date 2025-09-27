import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-indigo-900 to-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-screen-md flex-col px-4 pb-10 pt-6 md:max-w-screen-lg md:px-6">
        <header className="flex items-center justify-between pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-accent-cyan/70">Lil Gargs</p>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">Verification Portal</h1>
          </div>
          <div className="hidden text-right text-xs opacity-70 md:block">
            Secure Solana wallet verification powered by Supabase.
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="pt-8 text-center text-xs text-white/50">
          Secure signature flow • Powered by Solana Wallet Adapter
        </footer>
      </div>
    </div>
  )
}

export default RootLayout
