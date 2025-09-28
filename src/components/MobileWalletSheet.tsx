"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'

type WalletWithReadyState = ReturnType<typeof useWallet>['wallets'][number]

const fallbackWallets = [
  {
    name: 'Phantom',
    description: 'Open this portal in the Phantom in-app browser.',
    accent: 'from-[#5340FF] to-[#8E64FF]',
    buildLink: (url: string) => `https://phantom.app/ul/v1/browse?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Solflare',
    description: 'Launch Solflare mobile and continue verification there.',
    accent: 'from-[#FFB347] to-[#FF5F6D]',
    buildLink: (url: string) => `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Backpack',
    description: 'Open with Backpack browser for seamless signing.',
    accent: 'from-[#00C6FB] to-[#005BEA]',
    buildLink: (url: string) => `https://backpack.app/ul/browse?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'OKX',
    description: 'Redirect to the OKX wallet dApp browser.',
    accent: 'from-[#05BFFD] to-[#27A4FF]',
    buildLink: (url: string) => `https://www.okx.com/links/dapp/visit?dappUrl=${encodeURIComponent(url)}`,
  },
]

type MobileWalletSheetProps = {
  isOpen: boolean
  onClose: () => void
  portalUrl: string
}

const MobileWalletSheet = ({ isOpen, onClose, portalUrl }: MobileWalletSheetProps) => {
  const { wallets: availableWallets, wallet, select, connect, connecting } = useWallet()
  const [pendingWalletName, setPendingWalletName] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    return undefined
  }, [isOpen])

  const detectedWallets = useMemo(
    () => availableWallets.filter((entry) => entry.readyState === WalletReadyState.Installed),
    [availableWallets],
  )

  const loadableWallets = useMemo(
    () =>
      availableWallets.filter(
        (entry) =>
          entry.readyState === WalletReadyState.Loadable || entry.readyState === WalletReadyState.NotDetected,
      ),
    [availableWallets],
  )

  const handleWalletSelect = useCallback(
    (entry: WalletWithReadyState) => {
      setConnectionError(null)
      setPendingWalletName(entry.adapter.name)
      select(entry.adapter.name)
    },
    [select],
  )

  useEffect(() => {
    if (!pendingWalletName) return
    if (!wallet || wallet.adapter.name !== pendingWalletName) return

    let cancelled = false

    void (async () => {
      try {
        await connect()
        if (!cancelled) {
          onClose()
        }
      } catch (error) {
        console.error('[wallet] Failed to connect', error)
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Failed to connect to the selected wallet. Please try again.'
          setConnectionError(message)
        }
      } finally {
        if (!cancelled) {
          setPendingWalletName(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pendingWalletName, wallet, connect, onClose])

  const handleFallbackLink = useCallback((buildLink: (url: string) => string) => {
    const target = buildLink(portalUrl)
    window.location.href = target
  }, [portalUrl])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-[#0B081A] px-4 pb-8 pt-6 shadow-glow"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mt-4 space-y-2 text-center">
              <h2 className="font-display text-xl">Open in wallet app</h2>
              <p className="text-sm text-white/60">
                Choose your installed wallet to reopen this verification portal in the in-app browser.
              </p>
            </div>

            {connectionError && (
              <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                {connectionError}
              </div>
            )}

            {detectedWallets.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Wallets detected on this device</p>
                {detectedWallets.map((entry) => {
                  const isPending = pendingWalletName === entry.adapter.name || connecting
                  return (
                    <button
                      key={entry.adapter.name}
                      type="button"
                      onClick={() => handleWalletSelect(entry)}
                      disabled={isPending}
                      className={`w-full rounded-2xl border border-white/10 bg-white/5 p-[1px] text-left transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60`}
                    >
                      <div className="rounded-2xl bg-[#0B081A] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {entry.adapter.icon && (
                              <img
                                src={entry.adapter.icon}
                                alt={`${entry.adapter.name} icon`}
                                className="h-8 w-8 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-display text-lg text-white">{entry.adapter.name}</p>
                              <p className="text-xs text-white/70">Ready to connect immediately.</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                            {isPending ? 'Connecting…' : 'Connect'}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {detectedWallets.length === 0 && loadableWallets.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Supported mobile wallets</p>
                {loadableWallets.map((entry) => (
                  <button
                    key={entry.adapter.name}
                    type="button"
                    onClick={() => handleWalletSelect(entry)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-[1px] text-left transition hover:bg-white/10"
                  >
                    <div className="rounded-2xl bg-[#0B081A] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {entry.adapter.icon && (
                            <img src={entry.adapter.icon} alt={`${entry.adapter.name} icon`} className="h-8 w-8 rounded-full" />
                          )}
                          <div>
                            <p className="font-display text-lg text-white">{entry.adapter.name}</p>
                            <p className="text-xs text-white/70">Tap to open in the wallet app.</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Open</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Deep link options</p>
              {fallbackWallets.map((walletOption) => (
                <button
                  key={walletOption.name}
                  type="button"
                  onClick={() => handleFallbackLink(walletOption.buildLink)}
                  className={`w-full rounded-2xl bg-gradient-to-r ${walletOption.accent} p-[1px] text-left`}
                >
                  <div className="rounded-2xl bg-[#0B081A] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-white">{walletOption.name}</p>
                        <p className="text-xs text-white/70">{walletOption.description}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Launch</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full border border-white/10 bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileWalletSheet
