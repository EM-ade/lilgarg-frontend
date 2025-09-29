"use client"

import { useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'

import { getSolanaRpcUrl } from '../lib/env'

interface WalletContextProviderProps {
  children: ReactNode
}

const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const endpoint = getSolanaRpcUrl()
  const cluster = WalletAdapterNetwork.Mainnet
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: cluster }),
      new BackpackWalletAdapter(),
      ...(walletConnectProjectId
        ? [
            new WalletConnectWalletAdapter({
              network: cluster,
              options: {
                projectId: walletConnectProjectId,
                relayUrl: 'wss://relay.walletconnect.com',
              },
            }),
          ]
        : []),
      new LedgerWalletAdapter(),
    ],
    [cluster, walletConnectProjectId],
  )

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
