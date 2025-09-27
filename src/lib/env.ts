export const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!url) {
    throw new Error('VITE_API_BASE_URL is not set. Please configure your environment variables.')
  }
  return url.replace(/\/$/, '')
}

export const getSolanaRpcUrl = () => {
  const url = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined
  return (url ?? 'https://api.mainnet-beta.solana.com').replace(/\/$/, '')
}
