"use client"

import { RECIPES, type Recipe } from "./recipes"

const KEY = "qifen-shared-recipes"

export function loadShared(): Recipe[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}

export function saveShared(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes))
}

export function addShared(recipe: Recipe): { success: boolean; message: string } {
  const existing = loadShared()
  const allTitles = [...RECIPES, ...existing].map((r) => r.title.toLowerCase().trim())
  if (allTitles.includes(recipe.title.toLowerCase().trim())) {
    return { success: false, message: "这道菜已经有人分享过了，换一道吧！" }
  }
  existing.push(recipe)
  saveShared(existing)
  return { success: true, message: "分享成功！+3 健康分" }
}

export function getRecipeBonus(): number {
  return Math.min(loadShared().length * 3, 15)
}
