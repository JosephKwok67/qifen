"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("七分用户")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError("请填写邮箱和密码"); return }
    if (password.length < 6) { setError("密码至少6位"); return }
    setLoading(true); setError("")
    const result = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, nickname.trim() || "七分用户")
    setLoading(false)
    if (result.error) { setError(result.error); return }
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold" style={{ color: "var(--color-accent)" }}>七分</div>
          <div className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>十分太满，七分刚好</div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "var(--color-bg-card)" }}>
          <div className="flex mb-5 rounded-xl p-1" style={{ background: "var(--color-bg)" }}>
            <button onClick={() => setIsLogin(true)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: isLogin ? "var(--color-accent)" : "transparent", color: isLogin ? "#fff" : "var(--color-text-secondary)" }}>登录</button>
            <button onClick={() => setIsLogin(false)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: !isLogin ? "var(--color-accent)" : "transparent", color: !isLogin ? "#fff" : "var(--color-text-secondary)" }}>注册</button>
          </div>

          {!isLogin && (
            <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="昵称" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={12} />
          )}

          <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="邮箱" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="密码（至少6位）" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} />

          {error && <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "var(--color-danger)", color: "#fff" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity" style={{ background: "var(--color-accent)", opacity: loading ? 0.6 : 1 }}>
            {loading ? "处理中..." : isLogin ? "登录" : "注册并开始使用"}
          </button>
        </div>
      </div>
    </div>
  )
}
