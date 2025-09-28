import { apiClient } from './apiClient'

export type ContractSummary = {
  contractAddress: string
  requiredNftCount: number
  ownedCount: number
  roleId?: string | null
  roleName?: string | null
  meetsRequirement: boolean
}

export type VerificationSession = {
  id: string
  discordId: string
  guildId: string
  walletAddress: string | null
  status: 'pending' | 'verified' | 'completed' | 'expired'
  expiresAt: string
  verifiedAt: string | null
  createdAt: string
  message?: string
  username?: string
  contractSummaries?: ContractSummary[]
}

export type CreateSessionResponse = {
  token: string
  status: VerificationSession['status']
  expiresAt: string
  message: string
}

export const fetchSessionByToken = async (token: string) => {
  const response = await apiClient.get<{ success: boolean; session: VerificationSession }>(
    `/api/verification/session/${token}`,
  )
  return response.data.session
}

export const submitSignature = async (token: string, signature: string, username?: string) => {
  const response = await apiClient.post(
    '/api/verification/session/verify',
    {
      token,
      signature,
      username,
    },
    { withCredentials: false },
  )
  return response.data
}
