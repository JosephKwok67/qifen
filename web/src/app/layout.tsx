import type { Metadata } from "next"
import { I18nProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/auth"
import "./globals.css"

export const metadata: Metadata = {
  title: "七分 - 懂你的饮食记录伙伴",
  description: "十分太满，七分刚好。吃饭是这样，生活也是。",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('qifen-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');d.classList[t==='dark'?'add':'remove']('dark')}catch(e){}})()` }} />
      </head>
      <body className="min-h-screen">
        <style>{`#__next-build-watcher,.nextjs-dev-indicator{display:none!important}`}</style>
        <AuthProvider><I18nProvider>{children}</I18nProvider></AuthProvider>
      </body>
    </html>
  )
}
