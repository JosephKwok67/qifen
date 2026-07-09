"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getTodayMeals, getMealsByDate, getRecentDays, saveMeal, deleteMeal, getStreak, getTodayActivities, getActivitiesByDate, saveActivity, deleteActivity, type Meal, type Activity } from "@/lib/store"
import { analyzeMeal, analyzeActivity, getDailyWellness, getWeekSummaries, getActivityTypes, type Analysis, type DailyWellness, type DaySummary } from "@/lib/analyzer"
import { getEncourage, type EncourageMsg } from "@/lib/encourage"
import { loadProfile, saveProfile, TITLES, MOCK_NAMES, REGIONS, type UserProfile } from "@/lib/profile"
import { RECIPES, type Recipe } from "@/lib/recipes"
import { loadShared, addShared, getRecipeBonus } from "@/lib/sharedRecipes"
import { useI18n, type Locale } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

const MEAL_TYPES = [
  { type: "breakfast" as const, icon: "🌅", labelKey: "meal.breakfast" },
  { type: "lunch" as const, icon: "☀️", labelKey: "meal.lunch" },
  { type: "dinner" as const, icon: "🌙", labelKey: "meal.dinner" },
  { type: "snack" as const, icon: "🍵", labelKey: "meal.snack" },
]
const SCORE_COLORS = { good: "#8fb996", ok: "#d4a853", caution: "#c97b6b" }
const DAILY_TIP = ["每餐加入一份深色蔬菜，抗炎效果翻倍。","试着用橄榄油代替普通食用油吧。","饭后散步15分钟，帮助消化还能提升活动分。","多吃深海鱼，每周至少两次，补充Omega-3。","把白米饭换成糙米或藜麦，血糖更平稳。","加一小把坚果当零食，健康脂肪和抗氧化剂都有了。","喝一杯绿茶代替奶茶，茶多酚是强效抗氧化物。","用姜、蒜、姜黄调味，天然的抗炎香料。"][Math.floor(Math.random() * 8)]

export default function Dashboard() {
  const { t, locale, setLocale } = useI18n()
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])
  const [todayActivities, setTodayActivities] = useState<Activity[]>([])
  const [recentDays, setRecentDays] = useState<string[]>([])
  const [streak, setStreakState] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<Record<string, { meals: Meal[]; activities: Activity[] }>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mealType, setMealType] = useState<"breakfast"|"lunch"|"dinner"|"snack">("lunch")
  const [foodContent, setFoodContent] = useState("")
  const [photo, setPhoto] = useState("")
  const [dark, setDark] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null)
  const [wellness, setWellness] = useState<DailyWellness>({ foodScore:0, activityScore:0, wellnessScore:0, mood:{emoji:"😐",label:"Neutral",labelCN:"平平淡淡",summary:""}, rating:"ok" })
  const [weekSummaries, setWeekSummaries] = useState<DaySummary[]>([])
  const [showWeek, setShowWeek] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [lbTab, setLbTab] = useState<"week"|"month">("week")
  const [encourage, setEncourage] = useState<EncourageMsg | null>(null)
  const [actType, setActType] = useState<Activity["type"]>("exercise")
  const [actContent, setActContent] = useState("")
  const [profile, setProfile] = useState<UserProfile>({ nickname:"七分用户", title:"健康新手", region:"广州" })
  const [editNickname, setEditNickname] = useState("")
  const [recipeDetail, setRecipeDetail] = useState<Recipe | null>(null)
  const [shareFormOpen, setShareFormOpen] = useState(false)
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([])
  const [shareTitle, setShareTitle] = useState("")
  const [shareDesc, setShareDesc] = useState("")
  const [shareIngredients, setShareIngredients] = useState("")
  const [shareStep1, setShareStep1] = useState(""); const [shareStep2, setShareStep2] = useState(""); const [shareStep3, setShareStep3] = useState("")
  const [shareTags, setShareTags] = useState("")
  const [shareVideo, setShareVideo] = useState("")

  const refresh = useCallback(() => {
    const meals = getTodayMeals(); const activities = getTodayActivities()
    setTodayMeals(meals); setTodayActivities(activities)
    setRecentDays(getRecentDays(5)); setStreakState(getStreak())
    setWellness(getDailyWellness(meals.map((m)=>m.content), activities))
    setWeekSummaries(getWeekSummaries()); setSharedRecipes(loadShared())
    if (typeof window !== "undefined") setDark(document.documentElement.classList.contains("dark"))
  }, [])
  useEffect(() => { const p = loadProfile(); setProfile(p); setEditNickname(p.nickname); refresh() }, [refresh])

  const handlePhoto = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"
    input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(reader.result as string); reader.readAsDataURL(file) }
    input.click()
  }
  const handleFoodSubmit = async () => {
    if (!foodContent.trim()) return; const today = new Date().toISOString().slice(0,10)
    const mealId = Date.now().toString(36)+Math.random().toString(36).slice(2,6)
    saveMeal({ id: mealId, type:mealType, content:foodContent.trim(), photo, date:today, createdAt:new Date().toISOString() })
    setFoodContent(""); setPhoto(""); refresh()

    // Call AI API via server route so the key stays on the server
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: foodContent.trim() }),
      })
      if (resp.ok) {
        const analysis = await resp.json()
        setLastAnalysis({
          score: analysis.score,
          rating: analysis.rating,
          goodFindings: analysis.goodFindings || [],
          concerns: analysis.concerns || [],
          suggestion: analysis.suggestion || "",
        })
        setEncourage(getEncourage(todayMeals.length + 1, streak, analysis.score))
        return
      }
    } catch {}
    // fallback to local
    const a = analyzeMeal(foodContent.trim())
    setLastAnalysis(a)
    setEncourage(getEncourage(todayMeals.length + 1, streak, a.score))
  }
  const handleActivitySubmit = () => {
    if (!actContent.trim()) return; const today = new Date().toISOString().slice(0,10)
    saveActivity({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), type:actType, content:actContent.trim(), date:today, createdAt:new Date().toISOString() })
    setEncourage(getEncourage(todayMeals.length, streak, wellness.wellnessScore))
    setActContent(""); refresh()
  }
  const handleDeleteMeal = (id: string) => { deleteMeal(id); setLastAnalysis(null); refresh() }
  const handleDeleteActivity = (id: string) => { deleteActivity(id); refresh() }
  const toggleDay = (date: string) => { if (expanded===date) { setExpanded(null); return }; setExpanded(date); setExpandedData((prev)=>({...prev,[date]:{meals:getMealsByDate(date),activities:getActivitiesByDate(date)}})) }
  const toggleTheme = () => { const el = document.documentElement; const isDark = !el.classList.contains("dark"); if (isDark) el.classList.add("dark"); else el.classList.remove("dark"); localStorage.setItem("qifen-theme",isDark?"dark":"light"); setDark(isDark) }
  const greeting = () => { const h = new Date().getHours(); if (h<11) return t("greeting.morning"); if (h<17) return t("greeting.noon"); return t("greeting.evening") }
  const fmt = (s: string) => { const d = new Date(s); return d.getMonth()+1+"月"+d.getDate()+"日 周"+["日","一","二","三","四","五","六"][d.getDay()] }
  const todayDate = fmt(new Date().toISOString().slice(0,10))
  const activityTypes = getActivityTypes()

  const bestDay = weekSummaries.filter((d)=>d.wellnessScore>0).sort((a,b)=>b.wellnessScore-a.wellnessScore)[0]
  const weekAvg = weekSummaries.filter((d)=>d.wellnessScore>0)
  const avgScore = weekAvg.length>0 ? Math.round(weekAvg.reduce((s,d)=>s+d.wellnessScore,0)/weekAvg.length) : 0

  const leaderboardUsers = MOCK_NAMES.map((name,i)=>({ name, region: REGIONS[i%REGIONS.length], title: TITLES[Math.floor(Math.random()*TITLES.length)] }))
  const lbData = useMemo(() => {
    const base = wellness.wellnessScore + getRecipeBonus()
    return leaderboardUsers.map((u,i)=>({ ...u, score: Math.round(base+((i*17+11)%21)-10) }))
      .concat([{ name:profile.nickname, region:profile.region, score:base, title:profile.title }])
      .sort((a,b)=>b.score-a.score)
  }, [wellness.wellnessScore, profile.nickname, profile.region, profile.title])
  const myRank = lbData.findIndex((u:any)=>u.name===profile.nickname)+1
  const top10 = lbData.slice(0,10)
  const titles: Record<number,string> = {1:"🥇 健康之王",2:"🥈 抗炎先锋",3:"🥈 抗炎先锋",4:"🥉 养生达人",5:"🥉 养生达人",6:"🥉 养生达人",7:"🌟 新锐之星",8:"🌟 新锐之星",9:"🌟 新锐之星",10:"🌟 新锐之星"}

  const card = "var(--color-bg-card)"
  const bg = "var(--color-bg)"

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: bg, color: "var(--color-text)" }}><div className="text-lg">加载中...</div></div>

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: bg, color: "var(--color-text)" }}>
      <div className="text-center max-w-sm w-full">
        <div className="flex justify-center mb-5">
          {/* 70% ring logo: 252°/360° arc representing "seven-tenths" */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="34" stroke="var(--color-border)" strokeWidth="8" />
            <circle cx="40" cy="40" r="34" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34 * 0.7} ${2 * Math.PI * 34}`}
              strokeDashoffset={-(2 * Math.PI * 34 * 0.125)}
              transform="rotate(-90 40 40)" />
          </svg>
        </div>
        <div className="text-4xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>七分</div>
        <div className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>十分太满，七分刚好。吃饭是这样，生活也是。</div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: card, border: "1px solid var(--color-border)" }}>
          <div className="text-sm mb-4 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            登录后开始记录饮食，AI 帮你温柔地回顾每一天。
          </div>
          <button onClick={() => router.push("/auth")} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-transform active:scale-[0.98]" style={{ background: "var(--color-accent)" }}>
            登录 / 注册
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: bg, color: "var(--color-text)" }}>
      <div className="sticky top-0 z-40 px-5 py-4" style={{ background: bg, borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-wider" style={{ color: "var(--color-text-muted)" }}>{todayDate}</div>
            <div className="text-lg font-bold mt-0.5">{greeting()}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--color-accent)" }}>{profile.nickname.slice(0,1)}</span>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{profile.nickname}</span>
            <button onClick={() => setSettingsOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:opacity-80" style={{ background: card, color: "var(--color-text-secondary)" }}>⚙</button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <div className="py-6">
          <div className="text-4xl font-bold leading-tight">{t("hero.line1")}</div>
          <div className="text-4xl font-bold leading-tight" style={{ color: "var(--color-accent)" }}>{t("hero.line2")}</div>
          <div className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>{t("hero.sub")}</div>
        </div>

        {encourage && (
          <div className="rounded-2xl p-4 mb-6 animate-pulse-once animate-card-in" style={{ background: card, borderLeft: "4px solid var(--color-accent)" }}>
            <div className="flex items-start gap-3"><span className="text-3xl">{encourage.emoji}</span><div className="flex-1"><div className="text-sm font-bold" style={{ color: "var(--color-accent-dark)" }}>{encourage.title}</div><div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{encourage.body}</div></div><button onClick={()=>setEncourage(null)} className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>✕</button></div>
          </div>
        )}

        {(todayMeals.length>0||todayActivities.length>0) && (
          <div className="rounded-2xl p-4 mb-6 animate-card-in" style={{ background: card }}>
            <div className="flex items-center gap-4"><div className="text-5xl">{wellness.mood.emoji}</div><div className="flex-1"><div className="text-base font-bold">{locale==="en"?wellness.mood.label:wellness.mood.labelCN}</div><div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{wellness.mood.summary}</div><div className="flex gap-3 mt-2"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background:SCORE_COLORS.good,color:"#fff" }}>🍽 {wellness.foodScore}分</span><span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#8bb8d6",color:"#fff" }}>🏃 +{Math.round(wellness.activityScore*0.5)}分</span><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:"var(--color-accent)",color:"#fff" }}>⭐ {wellness.wellnessScore+getRecipeBonus()}分</span></div></div></div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <div className="flex-1 rounded-2xl px-4 py-4" style={{ background:card }}><div className="text-3xl font-bold" style={{ color:"var(--color-accent)" }}>{streak}</div><div className="text-xs mt-1" style={{ color:"var(--color-text-muted)" }}>连续记录</div></div>
          <div className="flex-1 rounded-2xl px-4 py-4" style={{ background:card }}><div className="text-3xl font-bold" style={{ color:"var(--color-accent)" }}>{todayMeals.length}</div><div className="text-xs mt-1" style={{ color:"var(--color-text-muted)" }}>今日餐数</div></div>
          <div className="flex-1 rounded-2xl px-4 py-4" style={{ background:card }}><div className="text-3xl font-bold" style={{ color:"#8bb8d6" }}>{wellness.activityScore}</div><div className="text-xs mt-1" style={{ color:"var(--color-text-muted)" }}>活动分</div></div>
        </div>

        {lastAnalysis && (
          <div className="rounded-2xl p-4 mb-6" style={{ background:card, borderLeft:"4px solid "+SCORE_COLORS[lastAnalysis.rating] }}>
            <div className="flex items-center gap-2 mb-3"><span>🤖</span><span className="text-xs font-semibold tracking-wider" style={{ color:"var(--color-text-muted)" }}>AI 饮食分析 {(lastAnalysis as any).source === "deepseek" ? "· DeepSeek" : "· 本地分析"}</span><span className="ml-auto text-sm font-bold" style={{ color:SCORE_COLORS[lastAnalysis.rating] }}>{lastAnalysis.score} 分</span></div>
            {lastAnalysis.goodFindings.length>0&&(<div className="mb-2"><div className="text-xs font-medium mb-1" style={{ color:SCORE_COLORS.good }}>✅ 做得好的</div>{lastAnalysis.goodFindings.map((f,i)=><div key={i} className="text-xs leading-relaxed ml-1" style={{ color:"var(--color-text-secondary)" }}>· {f}</div>)}</div>)}
            {lastAnalysis.concerns.length>0&&(<div className="mb-2"><div className="text-xs font-medium mb-1" style={{ color:SCORE_COLORS.caution }}>⚠️ 需注意</div>{lastAnalysis.concerns.map((c,i)=><div key={i} className="text-xs leading-relaxed ml-1" style={{ color:"var(--color-text-secondary)" }}>· {c}</div>)}</div>)}
            <div className="mt-3 pt-3 text-xs leading-relaxed" style={{ color:"var(--color-accent-dark)", borderTop:"1px solid var(--color-divider)" }}>💡 {lastAnalysis.suggestion}</div>
            <button onClick={()=>setLastAnalysis(null)} className="mt-3 text-xs" style={{ color:"var(--color-text-muted)" }}>收起 ↑</button>
          </div>
        )}

        <div className="rounded-2xl p-4 mb-4" style={{ background:card }}>
          <div className="text-xs font-semibold tracking-wider mb-3" style={{ color:"var(--color-text-muted)" }}>🍽 记录饮食</div>
          <div className="flex gap-2 mb-3 flex-wrap">{MEAL_TYPES.map(mt=><button key={mt.type} onClick={()=>setMealType(mt.type)} className="px-3.5 py-1.5 rounded-full text-xs font-medium border" style={{ background:mealType===mt.type?"var(--color-accent)":"transparent",color:mealType===mt.type?"#fff":"var(--color-text-secondary)",borderColor:mealType===mt.type?"var(--color-accent)":"var(--color-border)" }}>{mt.icon} {t(mt.labelKey)}</button>)}</div>
          <div className="flex gap-2"><input className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background:bg,color:"var(--color-text)" }} placeholder={t("quick.placeholder")} value={foodContent} onChange={e=>setFoodContent(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleFoodSubmit()}} /><button onClick={handlePhoto} className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background:bg }}>{photo?"✅":"📷"}</button><button onClick={handleFoodSubmit} disabled={!foodContent.trim()} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background:"var(--color-accent)",opacity:foodContent.trim()?1:0.4 }}>{t("quick.submit")}</button></div>
          {photo&&(<div className="mt-3 relative w-20 h-20"><img src={photo} alt="preview" className="w-20 h-20 rounded-xl object-cover" /><button onClick={()=>setPhoto("")} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background:"var(--color-danger)" }}>✕</button></div>)}
        </div>

        <div className="rounded-2xl p-4 mb-6" style={{ background:card }}>
          <div className="text-xs font-semibold tracking-wider mb-3" style={{ color:"var(--color-text-muted)" }}>🏃 记录活动</div>
          <div className="flex gap-2 mb-3 flex-wrap">{activityTypes.map(at=><button key={at.type} onClick={()=>setActType(at.type)} className="px-3.5 py-1.5 rounded-full text-xs font-medium border" style={{ background:actType===at.type?"var(--color-accent)":"transparent",color:actType===at.type?"#fff":"var(--color-text-secondary)",borderColor:actType===at.type?"var(--color-accent)":"var(--color-border)" }}>{at.emoji} {at.label}</button>)}</div>
          <div className="flex gap-2"><input className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background:bg,color:"var(--color-text)" }} placeholder="做了什么？比如：跑步30分钟..." value={actContent} onChange={e=>setActContent(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleActivitySubmit()}} /><button onClick={handleActivitySubmit} disabled={!actContent.trim()} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background:"var(--color-accent)",opacity:actContent.trim()?1:0.4 }}>记录</button></div>
        </div>

        <div className="mb-8">
          <div className="text-xs tracking-wider mb-3" style={{ color:"var(--color-text-muted)" }}>今天</div>
          {todayMeals.length===0&&todayActivities.length===0?(<div className="text-sm py-6 text-center rounded-2xl" style={{ background:card,color:"var(--color-text-muted)" }}>今天还没有记录</div>):(<div className="space-y-2">{todayMeals.map(meal=>{const a=analyzeMeal(meal.content);return(<div key={meal.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:card }}><div className="w-2 h-2 rounded-full shrink-0" style={{ background:SCORE_COLORS[a.rating] }}/><span className="text-lg">🍽</span><span className="flex-1 text-sm truncate">{meal.content}</span><span className="text-xs font-semibold shrink-0" style={{ color:SCORE_COLORS[a.rating] }}>{a.score}</span><button onClick={()=>handleDeleteMeal(meal.id)} className="text-xs shrink-0" style={{ color:"var(--color-text-muted)" }}>删除</button></div>)})}{todayActivities.map(act=>(<div key={act.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:card }}><div className="w-2 h-2 rounded-full shrink-0" style={{ background:"#8bb8d6" }}/><span className="text-lg">{activityTypes.find(at=>at.type===act.type)?.emoji}</span><span className="flex-1 text-sm truncate">{act.content}</span><span className="text-xs font-semibold shrink-0 mr-2 px-1.5 py-0.5 rounded" style={{ background:"var(--color-divider)",color:"#8bb8d6" }}>{analyzeActivity(act)}分</span><button onClick={()=>handleDeleteActivity(act.id)} className="text-xs shrink-0" style={{ color:"var(--color-text-muted)" }}>删除</button></div>))}</div>)}
        </div>

        {weekSummaries.filter(d=>d.wellnessScore>0).length>=1&&(
          <div className="mb-6">
            <button onClick={()=>setShowWeek(!showWeek)} className="w-full flex items-center justify-between rounded-2xl p-4 cursor-pointer hover:opacity-90" style={{ background:card }}>
              <div className="text-xs tracking-wider" style={{ color:"var(--color-text-muted)" }}>📊 本周健康趋势</div>
              <div className="flex items-center gap-3"><div className="text-xs" style={{ color:"var(--color-text-secondary)" }}>均分 {avgScore} · 最佳 {bestDay?.wellnessScore||0}</div><span style={{ color:"var(--color-text-muted)" }}>{showWeek?"▲":"▼"}</span></div>
            </button>
            {showWeek&&(<div className="mt-2 space-y-2"><div className="p-4 rounded-2xl" style={{ background:card }}>
              <div className="flex items-end gap-1.5 h-28 mb-3">{weekSummaries.map((d,i)=>{const isSel=selectedDay===d.date;const dl=["日","一","二","三","四","五","六"][new Date(d.date).getDay()];return(<button key={i} onClick={()=>d.wellnessScore>0&&setSelectedDay(isSel?null:d.date)} className="flex-1 flex flex-col items-center gap-1 cursor-pointer" style={{ opacity:d.wellnessScore>0?1:0.3 }}><span className="text-xs font-semibold" style={{ color:isSel?"var(--color-accent)":d.wellnessScore>0?"var(--color-text-secondary)":"var(--color-text-muted)" }}>{d.wellnessScore||"-"}</span><div className="w-full rounded-t-md" style={{ height:Math.max(4,(d.wellnessScore/100)*80)+"px",background:isSel?"var(--color-accent)":d.wellnessScore>=70?SCORE_COLORS.good:d.wellnessScore>=40?SCORE_COLORS.ok:d.wellnessScore>0?SCORE_COLORS.caution:"var(--color-divider)",boxShadow:isSel?"0 2px 8px rgba(0,0,0,0.15)":"none" }}/><span className="text-xs" style={{ color:isSel?"var(--color-accent)":"var(--color-text-muted)",fontWeight:isSel?700:400 }}>{dl}</span></button>)})}</div>
              <div className="mt-2 pt-3 flex gap-4 text-xs" style={{ borderTop:"1px solid var(--color-divider)",color:"var(--color-text-secondary)" }}><span>🏆 最佳: {bestDay?fmt(bestDay.date):"-"} ({bestDay?.wellnessScore||0}分)</span><span>📈 周均: {avgScore}分</span><span>🔥 连续: {streak}天</span></div>
            </div>
            {selectedDay&&(()=>{const dm=getMealsByDate(selectedDay);const da=getActivitiesByDate(selectedDay);const dw=weekSummaries.find(d=>d.date===selectedDay);return(<div className="p-4 rounded-2xl space-y-3" style={{ background:card,borderLeft:"4px solid var(--color-accent)" }}><div className="flex items-center justify-between"><div><span className="text-sm font-bold">{fmt(selectedDay)}</span><span className="text-xs ml-2 px-2 py-0.5 rounded-full text-white" style={{ background:dw&&dw.wellnessScore>=70?SCORE_COLORS.good:dw&&dw.wellnessScore>=40?SCORE_COLORS.ok:SCORE_COLORS.caution }}>综合 {dw?.wellnessScore||0} 分</span></div><button onClick={()=>setSelectedDay(null)} className="text-xs" style={{ color:"var(--color-text-muted)" }}>✕</button></div>{dm.length===0&&da.length===0?(<div className="text-xs py-2" style={{ color:"var(--color-text-muted)" }}>这天没有记录</div>):(<>{dm.length>0&&(<div><div className="text-xs font-medium mb-1.5" style={{ color:"var(--color-text-muted)" }}>🍽 饮食</div>{dm.map(meal=>{const a=analyzeMeal(meal.content);return(<div key={meal.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs" style={{ background:"var(--color-divider)" }}><div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:SCORE_COLORS[a.rating] }}/><span className="flex-1 truncate" style={{ color:"var(--color-text-secondary)" }}>{meal.content}</span><span className="font-semibold shrink-0" style={{ color:SCORE_COLORS[a.rating] }}>{a.score}</span></div>)})}</div>)}{da.length>0&&(<div><div className="text-xs font-medium mb-1.5" style={{ color:"var(--color-text-muted)" }}>🏃 活动</div>{da.map(act=>(<div key={act.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs" style={{ background:"var(--color-divider)" }}><span>{activityTypes.find(at=>at.type===act.type)?.emoji}</span><span className="flex-1 truncate" style={{ color:"var(--color-text-secondary)" }}>{act.content}</span></div>))}</div>)}</>)}</div>)})()}</div>)}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3"><div className="text-xs tracking-wider" style={{ color:"var(--color-text-muted)" }}>🥗 三分菜谱</div><button onClick={()=>setShareFormOpen(true)} className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ background:"var(--color-accent)" }}>+ 分享菜谱</button></div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollSnapType:"x mandatory" }}>{[...RECIPES,...sharedRecipes].map(r=><button key={r.id} onClick={()=>setRecipeDetail(r)} className="shrink-0 w-52 rounded-2xl p-4 text-left hover:opacity-90 active:scale-[0.98]" style={{ background:card,scrollSnapAlign:"start" }}><div className="text-4xl mb-2">{r.steps[0].emoji}</div><div className="text-sm font-semibold mb-1">{r.title}</div><div className="text-xs leading-relaxed mb-2" style={{ color:"var(--color-text-secondary)" }}>{(r.description||"").slice(0,50)}...</div><div className="flex gap-1.5 flex-wrap">{r.tags.map(tag=><span key={tag} className="px-2 py-0.5 rounded-full text-xs border" style={{ background:"var(--color-bg)",borderColor:"var(--color-border)",color:"var(--color-text-muted)" }}>{tag}</span>)}</div><div className="flex items-center gap-2 mt-2 text-xs" style={{ color:"var(--color-text-muted)" }}><span>⏱ {r.time}</span><span>·</span><span>🔥 {r.calories}</span></div></button>)}</div>
        </div>

        <div className="rounded-2xl p-4 mb-6 animate-card-in" style={{ background:card }}><div className="flex items-start gap-3"><span className="text-xl">💡</span><div className="flex-1"><div className="text-xs font-semibold tracking-wider mb-1" style={{ color:"var(--color-text-muted)" }}>每日健康小贴士</div><div className="text-sm leading-relaxed" style={{ color:"var(--color-text-secondary)" }}>{DAILY_TIP}</div></div></div></div>

        <div className="mb-6"><div className="rounded-2xl p-4" style={{ background:card }}><div className="flex items-center justify-between mb-4"><div className="text-xs tracking-wider" style={{ color:"var(--color-text-muted)" }}>🏅 {lbTab==="week"?"本周地区排行":"本月地区排行"}</div><div className="flex gap-1"><button onClick={()=>setLbTab("week")} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background:lbTab==="week"?"var(--color-accent)":"transparent",color:lbTab==="week"?"#fff":"var(--color-text-secondary)",border:lbTab==="week"?"none":"1px solid var(--color-border)" }}>本周</button><button onClick={()=>setLbTab("month")} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background:lbTab==="month"?"var(--color-accent)":"transparent",color:lbTab==="month"?"#fff":"var(--color-text-secondary)",border:lbTab==="month"?"none":"1px solid var(--color-border)" }}>本月</button></div></div><div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background:"var(--color-bg)",border:"2px solid var(--color-accent)" }}><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background:"var(--color-accent)" }}>{myRank}</div><div className="flex-1"><div className="text-sm font-semibold">{profile.nickname}</div><div className="text-xs" style={{ color:"var(--color-text-muted)" }}>{profile.region} · {profile.title}</div></div><div className="text-right"><div className="text-sm font-bold" style={{ color:"var(--color-accent)" }}>{wellness.wellnessScore+getRecipeBonus()} 分</div><div className="text-xs" style={{ color:"var(--color-text-muted)" }}>{titles[myRank]||"继续加油 💪"}</div></div></div><div className="space-y-1">{top10.map((u:any,i)=>(<div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background:u.name===profile.nickname?"var(--color-bg)":"transparent",opacity:u.name===profile.nickname?1:0.8 }}><div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"var(--color-divider)",color:i<3?"#333":"var(--color-text-muted)" }}>{i+1}</div><div className="flex-1"><div className="text-sm font-medium">{u.name}</div><div className="text-xs" style={{ color:"var(--color-text-muted)" }}>{u.region} · {u.title||""}</div></div><div className="text-right"><div className="text-sm font-semibold" style={{ color:u.name===profile.nickname?"var(--color-accent)":"var(--color-text)" }}>{u.score} 分</div><div className="text-xs" style={{ color:"var(--color-text-muted)" }}>{titles[i+1]||""}</div></div></div>))}</div></div></div>

        {recentDays.length>0&&(<div><div className="text-xs tracking-wider mb-3" style={{ color:"var(--color-text-muted)" }}>最近记录</div><div className="space-y-2">{recentDays.map(date=>(<div key={date}><button onClick={()=>toggleDay(date)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:opacity-90" style={{ background:card }}><span className="text-sm font-medium">{fmt(date)}</span><span style={{ color:"var(--color-text-muted)" }}>{(expandedData[date]||{meals:getMealsByDate(date),activities:getActivitiesByDate(date)}).meals.length} 餐 · {(expandedData[date]||{meals:getMealsByDate(date),activities:getActivitiesByDate(date)}).activities.length} 活动</span></button>{expanded===date&&(<div className="mt-1 ml-4 space-y-1">{(expandedData[date]?.meals||[]).map(meal=>(<div key={meal.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--color-divider)" }}><span>🍽</span><span className="flex-1 text-xs truncate" style={{ color:"var(--color-text-secondary)" }}>{meal.content}</span></div>))}{(expandedData[date]?.activities||[]).map(act=>(<div key={act.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--color-divider)" }}><span>{activityTypes.find(at=>at.type===act.type)?.emoji}</span><span className="flex-1 text-xs truncate" style={{ color:"var(--color-text-secondary)" }}>{act.content}</span></div>))}</div>)}</div>))}</div></div>)}
      </div>

      {/* Share Recipe Form */}
      {shareFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background:"rgba(0,0,0,0.4)" }} onClick={()=>setShareFormOpen(false)}>
          <div className="min-h-screen flex items-start justify-center py-6 px-4"><div className="w-full max-w-lg rounded-2xl p-5" style={{ background:card,color:"var(--color-text)" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><div className="text-lg font-bold">分享菜谱</div><button onClick={()=>setShareFormOpen(false)} className="text-sm" style={{ color:"var(--color-text-muted)" }}>✕</button></div>
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>菜名 *</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareTitle} onChange={e=>setShareTitle(e.target.value)} placeholder="如：香煎鸡胸配藜麦" />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>简介</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareDesc} onChange={e=>setShareDesc(e.target.value)} placeholder="一句话介绍这道菜" />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>食材（逗号分隔）</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareIngredients} onChange={e=>setShareIngredients(e.target.value)} placeholder="鸡胸肉 200g, 藜麦 100g..." />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>步骤一</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareStep1} onChange={e=>setShareStep1(e.target.value)} placeholder="第一步..." />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>步骤二</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareStep2} onChange={e=>setShareStep2(e.target.value)} placeholder="第二步..." />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>步骤三</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareStep3} onChange={e=>setShareStep3(e.target.value)} placeholder="第三步..." />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>标签（逗号分隔）</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareTags} onChange={e=>setShareTags(e.target.value)} placeholder="高蛋白, 低卡, 快手" />
            <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>视频链接（选填）</div><input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={shareVideo} onChange={e=>setShareVideo(e.target.value)} placeholder="YouTube 嵌入链接" />
            <button onClick={()=>{if(!shareTitle.trim())return;const recipe:any={id:"user-"+Date.now().toString(36),title:shareTitle.trim(),description:shareDesc.trim()||"用户分享",tags:shareTags?shareTags.split(",").map((t:string)=>t.trim()).filter(Boolean):["自制"],time:"自定义",difficulty:"中等",ingredients:shareIngredients?shareIngredients.split(",").map((s:string)=>s.trim()).filter(Boolean):["自定义"],steps:[{emoji:"1️⃣",text:shareStep1||"准备"},{emoji:"2️⃣",text:shareStep2||"烹饪"},{emoji:"3️⃣",text:shareStep3||"享用"}],videoUrl:shareVideo||"https://www.youtube.com/embed/dQw4w9WgXcQ",healthScore:70,calories:"自定义"};const r=addShared(recipe);if(r.success){setSharedRecipes(loadShared());setShareFormOpen(false);setShareTitle("");setShareDesc("");setShareIngredients("");setShareStep1("");setShareStep2("");setShareStep3("");setShareTags("");setShareVideo("");refresh()}alert(r.message)}} disabled={!shareTitle.trim()} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity" style={{ background:"var(--color-accent)",opacity:shareTitle.trim()?1:0.4 }}>提交分享 (+3分)</button>
            <div className="text-xs mt-3 text-center" style={{ color:"var(--color-text-muted)" }}>已分享 {sharedRecipes.length} 道菜谱 · 最多 15 分</div>
          </div></div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {recipeDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background:"rgba(0,0,0,0.4)" }} onClick={()=>setRecipeDetail(null)}>
          <div className="min-h-screen flex items-start justify-center py-6 px-4"><div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background:card,color:"var(--color-text)" }} onClick={e=>e.stopPropagation()}>
            <div className="p-5 pb-0"><div className="flex items-start justify-between mb-3"><div className="text-4xl">{recipeDetail.steps[0].emoji}</div><button onClick={()=>setRecipeDetail(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background:"var(--color-bg)",color:"var(--color-text-muted)" }}>✕</button></div><div className="text-xl font-bold mb-1">{recipeDetail.title}</div><div className="text-sm leading-relaxed mb-3" style={{ color:"var(--color-text-secondary)" }}>{recipeDetail.description}</div><div className="flex gap-2 flex-wrap mb-3">{recipeDetail.tags.map(tag=><span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background:"var(--color-bg)",color:"var(--color-accent-dark)" }}>{tag}</span>)}</div><div className="flex gap-3 text-xs mb-4" style={{ color:"var(--color-text-muted)" }}><span>⏱ {recipeDetail.time}</span><span>🔥 {recipeDetail.calories}</span><span>⭐ {recipeDetail.healthScore}分</span><span>· {recipeDetail.difficulty}</span></div></div>
            <div className="px-5 py-3" style={{ background:"var(--color-bg)" }}><div className="text-xs font-semibold tracking-wider mb-2" style={{ color:"var(--color-text-muted)" }}>📋 食材</div><div className="flex flex-wrap gap-2">{recipeDetail.ingredients.map((ing,i)=><span key={i} className="px-3 py-1.5 rounded-lg text-xs" style={{ background:card,color:"var(--color-text-secondary)" }}>{ing}</span>)}</div></div>
            <div className="px-5 py-4"><div className="text-xs font-semibold tracking-wider mb-3" style={{ color:"var(--color-text-muted)" }}>👨‍🍳 三步教学</div><div className="space-y-4">{recipeDetail.steps.map((step,i)=><div key={i} className="flex gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background:"var(--color-bg)" }}>{step.emoji}</div><div className="flex-1"><div className="text-xs font-semibold mb-0.5" style={{ color:"var(--color-accent)" }}>步骤 {i+1}</div><div className="text-sm leading-relaxed" style={{ color:"var(--color-text-secondary)" }}>{step.text}</div></div></div>)}</div></div>
            <div className="px-5 pb-5"><div className="text-xs font-semibold tracking-wider mb-2" style={{ color:"var(--color-text-muted)" }}>🎬 视频教学</div><div className="aspect-video rounded-xl overflow-hidden" style={{ background:"var(--color-bg)" }}><iframe src={recipeDetail.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={recipeDetail.title}/></div></div>
            <div className="px-5 pb-5"><button onClick={()=>setRecipeDetail(null)} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:"var(--color-accent)" }}>关闭</button></div>
          </div></div>
        </div>
      )}

      {/* Settings Overlay */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex" style={{ background:"rgba(0,0,0,0.3)" }} onClick={()=>setSettingsOpen(false)}>
          <div className="ml-auto w-72 h-full px-5 py-6 overflow-y-auto" style={{ background:card,color:"var(--color-text)" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8"><div className="text-lg font-bold">{t("settings.title")}</div><button onClick={()=>setSettingsOpen(false)} className="text-sm" style={{ color:"var(--color-text-muted)" }}>{t("settings.close")}</button></div>
            <div className="space-y-5">
              <div className="pb-4" style={{ borderBottom:"1px solid var(--color-divider)" }}>
                <div className="text-xs mb-3" style={{ color:"var(--color-text-muted)" }}>个人档案</div>
                <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)" }} value={editNickname} onChange={e=>setEditNickname(e.target.value)} maxLength={12} placeholder="输入昵称" />
                <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>地区</div>
                <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3" style={{ background:"var(--color-bg)",color:"var(--color-text)",border:"1px solid var(--color-border)" }} value={profile.region} onChange={e=>setProfile(p=>({...p,region:e.target.value}))}>{REGIONS.map(r=><option key={r} value={r}>{r}</option>)}</select>
                <div className="text-xs mb-1.5" style={{ color:"var(--color-text-muted)" }}>称号</div>
                <div className="flex flex-wrap gap-1.5">{TITLES.map(title=><button key={title} onClick={()=>setProfile(p=>({...p,title}))} className="px-2.5 py-1 rounded-full text-xs border" style={{ background:profile.title===title?"var(--color-accent)":"transparent",color:profile.title===title?"#fff":"var(--color-text-secondary)",borderColor:profile.title===title?"var(--color-accent)":"var(--color-border)" }}>{title}</button>)}</div>
                <button onClick={()=>{const p={nickname:editNickname.trim()||"七分用户",title:profile.title,region:profile.region};setProfile(p);saveProfile(p);setSettingsOpen(false)}} className="w-full mt-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background:"var(--color-accent)" }}>保存档案</button>
              </div>
              <div><div className="text-xs mb-2.5" style={{ color:"var(--color-text-muted)" }}>语言 / Language</div><div className="flex gap-2">{[{value:"zh-CN"as Locale,label:"简"},{value:"zh-TW"as Locale,label:"繁"},{value:"en"as Locale,label:"EN"}].map(l=><button key={l.value} onClick={()=>setLocale(l.value)} className="px-3.5 py-1.5 rounded-full text-xs border" style={{ background:locale===l.value?"var(--color-accent)":"transparent",color:locale===l.value?"#fff":"var(--color-text-secondary)",borderColor:locale===l.value?"var(--color-accent)":"var(--color-border)" }}>{l.label}</button>)}</div></div>
              <div className="flex items-center justify-between py-2"><span className="text-sm">{t("settings.theme")}</span><button onClick={toggleTheme} className="w-12 h-7 rounded-full relative" style={{ background:dark?"var(--color-accent)":"var(--color-border)" }}><span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform" style={{ left:dark?"22px":"2px" }}/></button></div>
              <div className="py-2 cursor-pointer" onClick={()=>alert(t("about.text"))}><span className="text-sm">{t("settings.about")}</span></div>
              <div className="text-sm cursor-pointer" onClick={() => signOut()} style={{ color: "var(--color-danger)" }}>退出登录</div><div className="pt-3 text-xs" style={{ color:"var(--color-text-muted)" }}>{user?.email}<br/>七分 v1.0 · {todayDate}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
