"use client"

export interface Meal {
  id: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  content: string
  photo: string
  date: string
  createdAt: string
}

export interface Activity {
  id: string
  type: "exercise" | "work" | "study" | "social" | "rest" | "outdoor" | "creative" | "other"
  content: string
  date: string
  createdAt: string
}

const MEALS_KEY = "qifen-meals"
const ACTIVITIES_KEY = "qifen-activities"

// Meals
export function loadMeals(): Meal[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(MEALS_KEY) || "[]") } catch { return [] }
}

export function saveMeal(meal: Meal) {
  const meals = loadMeals(); meals.push(meal)
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
}

export function deleteMeal(id: string) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(loadMeals().filter((m) => m.id !== id)))
}

export function getTodayMeals(): Meal[] {
  const today = new Date().toISOString().slice(0, 10)
  return loadMeals().filter((m) => m.date === today)
}

export function getHistoryDates(): string[] {
  return [...new Set(loadMeals().map((m) => m.date))].sort().reverse()
}

export function getMealsByDate(date: string): Meal[] {
  return loadMeals().filter((m) => m.date === date)
}

export function getStreak(): number {
  const dates = getHistoryDates()
  if (dates.length === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (dates.includes(expected.toISOString().slice(0, 10))) streak++
    else break
  }
  return streak
}

export function getRecentDays(limit: number): string[] {
  return getHistoryDates().slice(1, limit + 1)
}

// Activities
export function loadActivities(): Activity[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || "[]") } catch { return [] }
}

export function saveActivity(activity: Activity) {
  const all = loadActivities(); all.push(activity)
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(all))
}

export function deleteActivity(id: string) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(loadActivities().filter((a) => a.id !== id)))
}

export function getTodayActivities(): Activity[] {
  const today = new Date().toISOString().slice(0, 10)
  return loadActivities().filter((a) => a.date === today)
}

export function getActivitiesByDate(date: string): Activity[] {
  return loadActivities().filter((a) => a.date === date)
}
