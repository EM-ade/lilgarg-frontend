"use client"

import type { ReactNode } from 'react'
import WalletContextProvider from '../providers/WalletContextProvider'

type ProvidersProps = {
  children: ReactNode
}

const Providers = ({ children }: ProvidersProps) => {
  return <WalletContextProvider>{children}</WalletContextProvider>
}

export default Providers
