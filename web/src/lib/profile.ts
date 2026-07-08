"use client"

export interface UserProfile {
  nickname: string
  title: string
  region: string
}

const PROFILE_KEY = "qifen-profile"

export const REGIONS = ["广州","深圳","上海","北京","杭州","成都","武汉","南京","长沙","重庆","西安","苏州"]

export const TITLES = [
  "健康新手",
  "抗炎先锋",
  "饮食达人",
  "七分大师",
  "全谷物战士",
  "地中海行者",
  "蔬食生活家",
  "养生新星",
  "轻食主义者",
  "均衡营养派",
]

export const MOCK_NAMES = [
  "抗炎饮食家阿明",
  "轻食达人小琳",
  "营养配餐师老王",
  "七分生活家",
  "全谷物控小李",
  "蔬食爱好者",
  "健康厨娘芳芳",
  "运动配餐师",
  "地中海胃",
  "均衡饮食派阿杰",
]

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return { nickname: "七分用户", title: "健康新手", region: "广州" }
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"nickname":"七分用户","title":"健康新手","region":"广州"}') }
  catch { return { nickname: "七分用户", title: "健康新手", region: "广州" } }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
