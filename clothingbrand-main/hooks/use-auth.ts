"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { auth } from "@/lib/firebase-config"

interface User {
  uid: string
  email: string | null
  displayName?: string | null
  photoURL?: string | null
  phoneNumber?: string | null
}

interface AuthStore {
  user: User | null
  loading: boolean
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, name?: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  initAuth: () => void
}

const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  phoneNumber: firebaseUser.phoneNumber,
})

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      showLoginModal: false,

      setShowLoginModal: (show) => set({ showLoginModal: show }),

      initAuth: () => {
        // Check for redirect result first
        getRedirectResult(auth)
          .then((result) => {
            if (result?.user) {
              set({ user: convertFirebaseUser(result.user), showLoginModal: false })
            }
          })
          .catch((error) => {
            console.error("Redirect result error:", error)
          })
        
        // Then set up auth state listener
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({ user: convertFirebaseUser(firebaseUser), loading: false })
          } else {
            set({ user: null, loading: false })
          }
        })
      },

      loginWithEmail: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          set({ user: convertFirebaseUser(userCredential.user), showLoginModal: false })
        } catch (error: any) {
          throw new Error(error.message || "Login failed")
        }
      },

      registerWithEmail: async (email, password, name) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          
          if (name && userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name })
          }
          
          set({ user: convertFirebaseUser(userCredential.user), showLoginModal: false })
        } catch (error: any) {
          throw new Error(error.message || "Registration failed")
        }
      },

      loginWithGoogle: async () => {
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({
            prompt: 'select_account'
          })
          
          try {
            const userCredential = await signInWithPopup(auth, provider)
            set({ user: convertFirebaseUser(userCredential.user), showLoginModal: false })
          } catch (popupError: any) {
            // If popup fails due to COOP or is blocked, handle gracefully
            if (
              popupError.code === 'auth/popup-blocked' ||
              popupError.code === 'auth/popup-closed-by-user' ||
              popupError.code === 'auth/cancelled-popup-request' ||
              popupError.message?.includes('Cross-Origin-Opener-Policy')
            ) {
              console.log("Popup blocked or COOP issue, please try again")
              throw new Error("Popup was blocked. Please allow popups for this site and try again.")
            }
            throw popupError
          }
        } catch (error: any) {
          console.error("Google sign-in error:", error)
          throw new Error(error.message || "Google sign-in failed")
        }
      },

      logout: async () => {
        try {
          await signOut(auth)
          set({ user: null })
          
          // Clear cart and wishlist from localStorage on logout
          localStorage.removeItem("cart-storage")
          localStorage.removeItem("wishlist-storage")
          
          // Dispatch storage event to notify other components
          window.dispatchEvent(new Event("storage"))
        } catch (error: any) {
          throw new Error(error.message || "Logout failed")
        }
      },

      resetPassword: async (email) => {
        try {
          await sendPasswordResetEmail(auth, email)
        } catch (error: any) {
          throw new Error(error.message || "Password reset failed")
        }
      },
    }),
    { 
      name: "auth-storage",
      partialize: (state) => ({ user: state.user })
    },
  ),
)
