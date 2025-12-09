import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,

      setAuth: (user, token) => {
        set({ user, token })
      },

      logout: () => {
        set({ user: null, token: null })
      },

      setHydrated: (state) => {
        set({ isHydrated: state })
      },
    }),
    {
      name: 'vtg-auth', // Key trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }), // Chỉ persist user và token
      onRehydrateStorage: () => (state) => {
        // Callback khi state được load từ localStorage
        state?.setHydrated(true)
      },
    }
  )
)

// Hook để kiểm tra đã hydrate chưa (tránh flash khi SSR/reload)
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated)
