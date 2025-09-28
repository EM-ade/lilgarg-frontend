"use client"

import { useMemo } from 'react'
import type { FC } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

interface WalletStatusCardProps {
  expectedAddress?: string | null
  onSignMessage?: () => Promise<void>
  signingDisabled?: boolean
  signingState?: 'idle' | 'signing' | 'success' | 'error'
  signingError?: string
}

const WalletStatusCard: FC<WalletStatusCardProps> = ({
  expectedAddress,
  onSignMessage,
  signingDisabled,
  signingState = 'idle',
  signingError,
}) => {
  const { publicKey, connected, wallet, signMessage } = useWallet()

  const truncatedAddress = useMemo(() => {
    if (!publicKey) return 'Not connected'
    const base58 = publicKey.toBase58()
    return `${base58.slice(0, 4)}…${base58.slice(-4)}`
  }, [publicKey])

  const addressMatches = useMemo(() => {
    if (!expectedAddress || !publicKey) return null
    return expectedAddress === publicKey.toBase58()
  }, [expectedAddress, publicKey])

  const message = useMemo(() => {
    if (!connected) return 'Connect your Solana wallet to continue.'
    if (addressMatches === false)
      return 'Connected wallet does not match the session wallet. Switch wallets and try again.'
    return 'Wallet connected. You can proceed to sign the verification message.'
  }, [connected, addressMatches])

  const handleSignClick = async () => {
    if (!onSignMessage) return
    await onSignMessage()
  }

  const showSignButton = connected && signMessage && addressMatches !== false
  const signingLabel =
    signingState === 'signing'
      ? 'Awaiting signature…'
      : signingState === 'success'
      ? 'Signature captured'
      : 'Sign verification message'

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan/70">Wallet Status</p>
          <p className="font-display text-lg text-white">{truncatedAddress}</p>
          <p className="text-xs text-white/60">{wallet ? wallet.adapter.name : 'No wallet detected yet'}</p>
        </div>
        <WalletMultiButton className="h-10 rounded-full bg-accent-gradient px-4 text-sm font-semibold text-white shadow-glow" />
      </div>

      <p className="text-sm text-white/70">{message}</p>

      {addressMatches === false && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
          This session expects <span className="font-mono">{expectedAddress}</span>. Please switch to that wallet in your wallet app and reconnect.
        </p>
      )}

      {showSignButton && onSignMessage && (
        <button
          type="button"
          onClick={handleSignClick}
          disabled={signingDisabled}
          className="w-full rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-midnight transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {signingLabel}
        </button>
      )}

      {signingState === 'error' && signingError && (
        <p className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-200">{signingError}</p>
      )}
    </div>
  )
}

export default WalletStatusCard
