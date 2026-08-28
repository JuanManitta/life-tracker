import { useEffect, useState } from 'react'
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
  type User,
} from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsubscribe = subscribeAuth((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signIn() {
    setError(null)
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setSigningIn(false)
    }
  }

  async function signOutCurrent() {
    await signOutUser()
  }

  return {
    user,
    loading,
    signingIn,
    error,
    signIn,
    signOut: signOutCurrent,
    isFirebaseConfigured,
  }
}
