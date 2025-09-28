export const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set. Please configure your environment variables.')
  }
  return url.replace(/\/$/, '')
}

export const getSolanaRpcUrl = () => {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com'
  return url.replace(/\/$/, '')
}
