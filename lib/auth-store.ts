'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const SENHA_COZINHA = '1234'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (password: string) => {
        const isValid = password === SENHA_COZINHA
        if (isValid) {
          set({ isAuthenticated: true })
        }
        return isValid
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
