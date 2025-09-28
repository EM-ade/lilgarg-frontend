import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="flex h-full flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-4">
        <h2 className="font-display text-3xl md:text-4xl">Lil Gargs Verification</h2>
        <p className="max-w-md text-sm text-white/70 md:text-base">
          Launch the verification portal from Discord to begin. You&apos;ll be guided through a secure Solana wallet
          signature flow optimized for mobile devices.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-glass px-6 py-5 text-left shadow-glow backdrop-blur">
        <h3 className="font-display text-lg">Testing locally?</h3>
        <p className="text-sm text-white/70">
          Append your session token to the URL like <span className="font-mono">/session/&lt;token&gt;</span> to jump
          directly into the verification flow.
        </p>
      </div>

      <Link
        href="/session/demo"
        className="rounded-full bg-accent-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-lg hover:shadow-accent-cyan/50"
      >
        View Demo Session
      </Link>
    </section>
  )
}
