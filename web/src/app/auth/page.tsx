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
  const [showPassword, setShowPassword] = useState(false)
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
          <div className="flex justify-center mb-4">
            <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="34" stroke="var(--color-border)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34 * 0.7} ${2 * Math.PI * 34}`}
                strokeDashoffset={-(2 * Math.PI * 34 * 0.125)}
                transform="rotate(-90 40 40)" />
            </svg>
          </div>
          <div className="text-3xl font-bold" style={{ color: "var(--color-accent)" }}>七分</div>
          <div className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>十分太满，七分刚好</div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
          <div className="flex mb-5 rounded-xl p-1" style={{ background: "var(--color-bg)" }}>
            <button onClick={() => setIsLogin(true)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: isLogin ? "var(--color-accent)" : "transparent", color: isLogin ? "#fff" : "var(--color-text-secondary)" }}>登录</button>
            <button onClick={() => setIsLogin(false)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: !isLogin ? "var(--color-accent)" : "transparent", color: !isLogin ? "#fff" : "var(--color-text-secondary)" }}>注册</button>
          </div>

          {!isLogin && (
            <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="昵称" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={12} />
          )}

          <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="邮箱" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />

          <div className="relative mb-4">
            <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-10" style={{ background: "var(--color-bg)", color: "var(--color-text)" }} placeholder="密码（至少6位）" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {showPassword ? "隐藏" : "显示"}
            </button>
          </div>

          {error && <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "var(--color-danger)", color: "#fff" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: "var(--color-accent)", opacity: loading ? 0.7 : 1 }}>
            {loading && <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "处理中..." : isLogin ? "登录" : "注册并开始使用"}
          </button>
        </div>
      </div>
    </div>
  )
}
