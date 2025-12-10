import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  type User 
} from "firebase/auth"
import { auth } from "./firebase-config"

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    // Try popup first, fallback to redirect on mobile or if popup fails
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("[v0] User signed in:", user.email)
      return user
    } catch (popupError: any) {
      // If popup is blocked or fails, use redirect
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        console.log("[v0] Popup blocked, using redirect")
        await signInWithRedirect(auth, provider)
        return null // Will be handled by getRedirectResult
      }
      throw popupError
    }
  } catch (error) {
    console.error("[v0] Google sign-in error:", error)
    throw error
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      const user = result.user
      console.log("[v0] User signed in via redirect:", user.email)
      return user
    }
    return null
  } catch (error) {
    console.error("[v0] Redirect result error:", error)
    throw error
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
    console.log("[v0] User signed out")
  } catch (error) {
    console.error("[v0] Sign-out error:", error)
    throw error
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}
