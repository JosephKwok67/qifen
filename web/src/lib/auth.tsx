"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient, type User, type Session } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface AuthState {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, nickname: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true,
  signUp: async () => ({}), signIn: async () => ({}), signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string, nickname: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      // Use the authenticated client so the user's JWT is sent automatically;
      // RLS policy auth.uid() = id will then allow the insert.
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        nickname,
        title: "健康新手",
        region: "广州",
      })
      if (profileError) {
        // Non-fatal: user can still use the app and fill profile later.
        console.warn("创建用户档案失败:", profileError.message)
      }
    }
    return {}
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut(); setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
export { supabase }
