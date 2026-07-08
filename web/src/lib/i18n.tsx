"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

export type Locale = "zh-CN" | "zh-TW" | "en"
const STORAGE_KEY = "qifen-locale"

const DICT: Record<string, Record<Locale, string>> = {
  "hero.line1": { "zh-CN": "十分太满", "zh-TW": "十分太滿", en: "Too Much Is" },
  "hero.line2": { "zh-CN": "七分刚好", "zh-TW": "七分剛好", en: "Just Enough" },
  "hero.sub": { "zh-CN": "吃饭是这样，生活也是", "zh-TW": "吃飯是這樣，生活也是", en: "In eating, as in life" },
  "greeting.morning": { "zh-CN": "早上好", "zh-TW": "早上好", en: "Good morning" },
  "greeting.noon": { "zh-CN": "中午好", "zh-TW": "中午好", en: "Good afternoon" },
  "greeting.evening": { "zh-CN": "晚上好", "zh-TW": "晚上好", en: "Good evening" },
  "stats.streak": { "zh-CN": "连续记录", "zh-TW": "連續記錄", en: "Day streak" },
  "stats.meals": { "zh-CN": "今日餐数", "zh-TW": "今日餐數", en: "Meals today" },
  "stats.empty": { "zh-CN": "今天还没记录呢", "zh-TW": "今天還沒記錄呢", en: "Nothing yet today" },
  "quick.title": { "zh-CN": "记录一餐", "zh-TW": "記錄一餐", en: "Log a meal" },
  "quick.placeholder": { "zh-CN": "吃了什么？比如：白粥、蒸鱼、青菜...", "zh-TW": "吃了什麼？比如：白粥、蒸魚、青菜...", en: "What did you eat? Rice, fish, veggies..." },
  "quick.submit": { "zh-CN": "记录", "zh-TW": "記錄", en: "Log" },
  "section.today": { "zh-CN": "今日饮食", "zh-TW": "今日飲食", en: "Today" },
  "section.history": { "zh-CN": "最近记录", "zh-TW": "最近記錄", en: "Recent" },
  "history.empty": { "zh-CN": "还没有记录，开始记录你的第一餐吧", "zh-TW": "還沒有記錄，開始記錄你的第一餐吧", en: "No records yet. Start your first meal!" },
  "history.delete": { "zh-CN": "删除", "zh-TW": "刪除", en: "Del" },
  "meal.breakfast": { "zh-CN": "早餐", "zh-TW": "早餐", en: "Breakfast" },
  "meal.lunch": { "zh-CN": "午餐", "zh-TW": "午餐", en: "Lunch" },
  "meal.dinner": { "zh-CN": "晚餐", "zh-TW": "晚餐", en: "Dinner" },
  "meal.snack": { "zh-CN": "加餐", "zh-TW": "加餐", en: "Snack" },
  "settings.title": { "zh-CN": "设置", "zh-TW": "設定", en: "Settings" },
  "settings.theme": { "zh-CN": "深色模式", "zh-TW": "深色模式", en: "Dark mode" },
  "settings.about": { "zh-CN": "关于七分", "zh-TW": "關於七分", en: "About" },
  "settings.close": { "zh-CN": "关闭", "zh-TW": "關閉", en: "Close" },
  "about.text": { "zh-CN": "十分太满，七分刚好。\n吃饭是这样，生活也是。\n\n七分 v1.0 — 懂你的饮食记录伙伴", "zh-TW": "十分太滿，七分剛好。\n吃飯是這樣，生活也是。\n\n七分 v1.0 — 懂你的飲食記錄夥伴", en: "Too much is just enough.\nIn eating, as in life.\n\nQifen v1.0 — Your mindful eating companion" },
}

interface I18nContext { locale: Locale; setLocale: (l: Locale) => void; t: (key: string) => string }
const ctx = createContext<I18nContext>({ locale: "zh-CN", setLocale: () => {}, t: () => "" })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-CN")
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && ["zh-CN","zh-TW","en"].includes(saved)) setLocaleState(saved)
  }, [])
  const setLocale = useCallback((l: Locale) => { setLocaleState(l); localStorage.setItem(STORAGE_KEY, l); if (typeof document !== "undefined") document.documentElement.lang = l }, [])
  const t = useCallback((key: string) => DICT[key]?.[locale] ?? key, [locale])
  return <ctx.Provider value={{ locale, setLocale, t }}>{children}</ctx.Provider>
}

export function useI18n() { return useContext(ctx) }
