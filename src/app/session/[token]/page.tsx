"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { AnimatePresence, motion } from 'framer-motion'

import { useSessionStore } from '@/store/sessionStore'
import WalletStatusCard from '@/components/WalletStatusCard'
import { submitSignature } from '@/services/verificationSessions'
import type { ContractSummary } from '@/services/verificationSessions'
import MobileWalletSheet from '@/components/MobileWalletSheet'

const SessionPage = () => {
  const params = useParams<{ token: string }>()
  const token = params?.token
  const { session, status, error, loadSession, lastFetchedAt } = useSessionStore()
  const { connected, publicKey, signMessage } = useWallet()

  const [signingState, setSigningState] = useState<'idle' | 'signing' | 'success' | 'error'>('idle')
  const [signingError, setSigningError] = useState<string | undefined>()
  const [verificationSummary, setVerificationSummary] = useState<null | {
    nftCount: number
    isVerified: boolean
    verifiedAt?: string
  }>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [expired, setExpired] = useState<boolean>(false)
  const [isMobileBrowser, setIsMobileBrowser] = useState<boolean>(false)
  const [isWalletSheetOpen, setIsWalletSheetOpen] = useState<boolean>(false)

  useEffect(() => {
    if (token) {
      void loadSession(token)
    }
  }, [token, loadSession])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = window.navigator.userAgent || ''
    const mobileRegex = /(Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini)/i
    setIsMobileBrowser(mobileRegex.test(ua))
  }, [])

  useEffect(() => {
    if (!session?.expiresAt) {
      setTimeLeft('')
      setExpired(false)
      return
    }

    const updateCountdown = () => {
      const expiry = new Date(session.expiresAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, expiry - now)
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      setExpired(diff === 0)
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [session?.expiresAt])

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isLoaded = status === 'loaded' && session

  const expectedWalletAddress = session?.walletAddress ?? undefined
  const contractSummaries: ContractSummary[] = session?.contractSummaries ?? []

  const handleSignMessage = async () => {
    if (!token || !session?.message || !signMessage) {
      return
    }

    if (!connected || !publicKey) {
      setSigningState('error')
      setSigningError('Connect your wallet to sign the verification message.')
      return
    }

    if (expectedWalletAddress && publicKey.toBase58() !== expectedWalletAddress) {
      setSigningState('error')
      setSigningError('Connected wallet does not match the session wallet. Switch wallets and try again.')
      return
    }

    try {
      setSigningState('signing')
      setSigningError(undefined)

      const messageBytes = new TextEncoder().encode(session.message)
      const signatureBytes = await signMessage(messageBytes)
      const signatureBase58 = bs58.encode(signatureBytes)

      const response = await submitSignature(token, signatureBase58)

      setSigningState('success')
      setVerificationSummary({
        nftCount: response.verification?.nftCount ?? 0,
        isVerified: response.verification?.isVerified ?? false,
        verifiedAt: response.verification?.verifiedAt,
      })

      await loadSession(token)
    } catch (err) {
      console.error('[session] signature submission failed', err)
      setSigningState('error')
      setSigningError(
        err instanceof Error ? err.message : 'Failed to sign or submit the verification message.',
      )
    }
  }

  const portalUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }, [])

  const shouldOfferMobileRedirect = isMobileBrowser && !connected

  const sessionStatusBadge = useMemo(() => {
    if (!session) return null
    const state = session.status
    const baseClass = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'

    switch (state) {
      case 'verified':
        return <span className={`${baseClass} bg-emerald-500/20 text-emerald-200`}>Verified</span>
      case 'completed':
        return <span className={`${baseClass} bg-blue-500/20 text-blue-200`}>Completed</span>
      case 'expired':
        return <span className={`${baseClass} bg-red-500/20 text-red-200`}>Expired</span>
      default:
        return <span className={`${baseClass} bg-yellow-500/20 text-yellow-100`}>Pending</span>
    }
  }, [session])

  return (
    <section className="flex h-full flex-col space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-cyan/60">Verification Session</p>
        <h2 className="font-display text-2xl">
          {token ? `${token.slice(0, 8)}…${token.slice(-6)}` : 'Loading token'}
        </h2>
        <p className="text-sm text-white/70">
          This portal will guide you through wallet connection, secure message signing, and automatic verification.
          Keep this tab open while you approve the signature in your Solana wallet.
        </p>
      </header>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-glass px-5 py-6 shadow-glow backdrop-blur">
        {isLoading && (
          <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-3 w-40 animate-pulse rounded-full bg-white/20" />
            <p className="text-sm text-white/70">Fetching session details…</p>
          </motion.div>
        )}

        {isError && (
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-lg text-red-300">Unable to load session</h3>
            <p className="text-sm text-white/70">{error}</p>
            <p className="text-xs text-white/50">
              Double-check the portal link from Discord or start a fresh session.
            </p>
          </motion.div>
        )}

        {isLoaded && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <div>
              <h3 className="font-display text-lg">Session ready</h3>
              <p className="text-sm text-white/70">
                Wallet address expected: <span className="font-mono text-white">{session.walletAddress}</span>
              </p>
              <div className="flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
                <p>Last updated: {lastFetchedAt ? new Date(lastFetchedAt).toLocaleTimeString() : 'now'}</p>
                <div className="flex items-center gap-2">
                  {sessionStatusBadge}
                  {timeLeft && !expired && <span>Expires in {timeLeft}</span>}
                  {expired && <span className="text-red-200">Session expired</span>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-accent-pink/80">Sign this message</p>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-all rounded-xl bg-black/40 p-3 text-[11px] text-white/80">
{session.message ?? 'Message will be displayed here.'}
              </pre>
            </div>

            {shouldOfferMobileRedirect && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsWalletSheetOpen(true)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white/80 transition hover:bg-white/10"
              >
                <span className="block font-display text-lg text-white">Continue in wallet app</span>
                <span className="text-xs text-white/60">
                  Launch this portal inside an installed Solana wallet for seamless signing.
                </span>
              </motion.button>
            )}

            <WalletStatusCard
              expectedAddress={expectedWalletAddress}
              onSignMessage={expired ? undefined : handleSignMessage}
              signingDisabled={expired || signingState === 'signing'}
              signingState={signingState}
              signingError={signingError}
            />

            <div className="grid gap-3 text-sm text-white/70">
              <p>Next steps:</p>
              <ul className="space-y-2">
                <li>1. Connect your Solana wallet (detected automatically on this device).</li>
                <li>2. Review and approve the signature request inside your wallet.</li>
                <li>3. Return to this portal to view verification status updates.</li>
              </ul>
            </div>

            <AnimatePresence>
              {verificationSummary && (
                <motion.div
                  key="verification-summary"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="space-y-2 rounded-2xl border border-white/10 bg-emerald-500/10 px-4 py-4 text-sm text-white/80"
                >
                  <p className="font-display text-lg text-emerald-200">Verification submitted</p>
                  <p>NFTs detected: {verificationSummary.nftCount}</p>
                  <p>Status: {verificationSummary.isVerified ? 'Verified ✅' : 'Awaiting NFT ownership'}</p>
                  {verificationSummary.verifiedAt && (
                    <p>Processed at: {new Date(verificationSummary.verifiedAt).toLocaleString()}</p>
                  )}

                  {contractSummaries.length > 0 && (
                    <div className="mt-4 space-y-3 rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Contract Requirements</p>
                      <ul className="space-y-2 text-xs">
                        {contractSummaries.map((contract: ContractSummary) => (
                          <li
                            key={contract.contractAddress}
                            className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/20 p-3"
                          >
                            <span className="font-mono text-xs text-white/80">{contract.contractAddress}</span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                              <span>
                                Needed: <strong>{contract.requiredNftCount}</strong>
                              </span>
                              <span>
                                Owned: <strong>{contract.ownedCount}</strong>
                              </span>
                              <span>
                                Role: <strong>{contract.roleName ?? '—'}</strong>
                              </span>
                              <span
                                className={
                                  contract.meetsRequirement
                                    ? 'rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-200'
                                    : 'rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200'
                                }
                              >
                                {contract.meetsRequirement ? 'Requirement met' : 'Requirement not met'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {verificationSummary && (
                <motion.div
                  key="verification-actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                >
                  <p className="font-display text-base text-white">All set!</p>
                  <p>
                    You can return to Discord to view your updated roles. A confirmation DM has been sent to your
                    account with the verification summary.
                  </p>
                  <a
                    href={`https://discord.com/channels/${session?.guildId ?? ''}`}
                    className="inline-flex items-center justify-center rounded-full bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:shadow-lg"
                  >
                    Open Discord
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && !isError && !isLoaded && (
          <p className="text-sm text-white/60">Provide a valid session token to continue.</p>
        )}
      </div>

      <MobileWalletSheet
        isOpen={isWalletSheetOpen}
        onClose={() => setIsWalletSheetOpen(false)}
        portalUrl={portalUrl}
      />
    </section>
  )
}

export default SessionPage
