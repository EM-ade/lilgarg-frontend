import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VerificationSession } from '../services/verificationSessions'
import { fetchSessionByToken } from '../services/verificationSessions'

export type SessionState = {
  session: VerificationSession | null
  lastFetchedAt: string | null
  token: string | null
  status: 'idle' | 'loading' | 'loaded' | 'error'
  error?: string
  loadSession: (token: string) => Promise<void>
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      lastFetchedAt: null,
      token: null,
      status: 'idle',
      error: undefined,
      async loadSession(token: string) {
        set({ status: 'loading', error: undefined, token })
        try {
          const data = await fetchSessionByToken(token)
          set({ session: data, status: 'loaded', lastFetchedAt: new Date().toISOString() })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to load verification session.'
          set({ status: 'error', error: message, session: null, lastFetchedAt: null })
        }
      },
      clearSession() {
        set({ session: null, token: null, status: 'idle', error: undefined, lastFetchedAt: null })
      },
    }),
    {
      name: 'lil-gargs-session',
      partialize: (state) => ({ token: state.token, session: state.session, lastFetchedAt: state.lastFetchedAt }),
    },
  ),
)
