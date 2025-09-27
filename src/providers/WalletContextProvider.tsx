import { useMemo } from 'react'
import type { FC, PropsWithChildren } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
} from '@solana-mobile/wallet-adapter-mobile'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'

import { getSolanaRpcUrl } from '../lib/env'

const cluster = WalletAdapterNetwork.Mainnet

export const WalletContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const endpoint = getSolanaRpcUrl()

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: cluster }),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolanaMobileWalletAdapter({
        appIdentity: {
          name: 'Lil Gargs Verification',
          uri: 'https://lilgargs.app',
          icon: 'https://lilgargs.app/icon.png',
        },
        addressSelector: createDefaultAddressSelector(),
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        onWalletNotFound: async () => {
          console.warn('Solana Mobile wallet not found, redirecting to wallet adapters list.')
          window.open('https://solana.com/ecosystem?categories=wallet', '_blank')
        },
        cluster,
      }),
    ],
    [],
  )

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'processed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
