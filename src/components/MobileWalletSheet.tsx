import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const wallets = [
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

  const handleWalletSelect = (buildLink: (url: string) => string) => {
    const target = buildLink(portalUrl)
    window.location.href = target
  }

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

            <div className="mt-6 space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => handleWalletSelect(wallet.buildLink)}
                  className={`w-full rounded-2xl bg-gradient-to-r ${wallet.accent} p-[1px] text-left`}
                >
                  <div className="rounded-2xl bg-[#0B081A] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-white">{wallet.name}</p>
                        <p className="text-xs text-white/70">{wallet.description}</p>
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
