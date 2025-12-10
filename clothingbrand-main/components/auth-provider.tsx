"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import AuthModal from "./auth-modal"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, showLoginModal, setShowLoginModal } = useAuth()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <>
      {children}
      <AuthModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  )
}
