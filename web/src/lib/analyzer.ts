export interface Analysis {
  score: number
  rating: "good" | "ok" | "caution"
  goodFindings: string[]
  concerns: string[]
  suggestion: string
}

export type ActivityType = "exercise" | "work" | "study" | "social" | "rest" | "outdoor" | "creative" | "other"

export interface Activity {
  id: string
  type: ActivityType
  content: string
  date: string
  createdAt: string
}

export interface MoodResult {
  emoji: string
  label: string
  labelCN: string
  summary: string
}

export interface DailyWellness {
  foodScore: number
  activityScore: number
  wellnessScore: number
  mood: MoodResult
  rating: Analysis["rating"]
}

// Food keywords — expanded, more granular
const ANTI_INFLAMMATORY: [string[], number, string][] = [
  // [keywords, scoreBonus, finding]
  [["鱼","三文鱼","沙丁鱼","鲭鱼","鳕鱼","金枪鱼","带鱼","鲈鱼","fish","salmon","sardine","mackerel","cod","tuna","sea bass","黄鱼","多宝鱼"], 14, "深海鱼富含 Omega-3，天然抗炎"],
  [["蔬菜","青菜","西兰花","菠菜","番茄","胡萝卜","芹菜","青椒","甘蓝","羽衣甘蓝","生菜","白菜","油菜","菜心","vegetable","broccoli","spinach","kale","tomato","carrot","celery","pepper","lettuce","cabbage","菜","瓜","茄子","芦笋","秋葵"], 10, "蔬菜富含抗氧化物和膳食纤维"],
  [["水果","蓝莓","草莓","橙子","苹果","香蕉","猕猴桃","牛油果","葡萄","樱桃","石榴","fruit","blueberry","berry","orange","apple","banana","kiwi","avocado","grape","cherry","pomegranate","火龙果","芒果","西瓜"], 9, "水果提供天然维生素和抗氧化物"],
  [["坚果","核桃","杏仁","腰果","开心果","nut","walnut","almond","cashew","pistachio","瓜子","南瓜子"], 8, "坚果含健康脂肪和维生素E"],
  [["橄榄油","亚麻籽","牛油果油","olive oil","flaxseed","avocado oil"], 8, "优质油脂有助于降低炎症"],
  [["姜","姜黄","蒜","葱","肉桂","ginger","turmeric","garlic","onion","cinnamon"], 7, "天然抗炎香料"],
  [["绿茶","抹茶","白茶","green tea","matcha","white tea"], 8, "茶多酚具强效抗氧化作用"],
  [["全麦","糙米","燕麦","藜麦","黑米","小米","荞麦","whole grain","brown rice","oat","quinoa","oatmeal","millet","buckwheat","全谷物"], 9, "全谷物稳定血糖，减少炎症"],
  [["豆腐","豆浆","豆类","黄豆","黑豆","鹰嘴豆","扁豆","tofu","soy","bean","legume","lentil","chickpea","毛豆"], 8, "植物蛋白富含异黄酮和纤维"],
  [["酸奶","发酵","纳豆","泡菜","味噌","yogurt","fermented","kimchi","miso","natto","酸菜","康普茶","kombucha","开菲尔","kefir"], 7, "发酵食品有益肠道菌群"],
  [["蒸","水煮","清炒","清蒸","白灼","steam","boil","炖","焖","凉拌","焯"], 6, "低温烹饪保留营养"],
  [["鸡蛋","鸡胸肉","鸡腿","瘦猪肉","牛肉","蛋","egg","chicken breast","lean","瘦肉"], 4, "优质蛋白，适量摄入"],
]

const PRO_INFLAMMATORY: [string[], number, string][] = [
  [["炸","油条","薯条","炸鸡","炸猪排","天妇罗","fried","fry","deep fry","chips","油煎","酥"], 16, "高温油炸产生促炎物质"],
  [["培根","火腿","香肠","午餐肉","腊肉","腊肠","bacon","ham","sausage","processed meat","熏肉","肉干","肉松"], 15, "加工肉制品含防腐剂和饱和脂肪"],
  [["糖","甜点","蛋糕","奶茶","可乐","汽水","冰淇淋","巧克力","奶昔","sugar","cake","candy","soda","cola","ice cream","chocolate","milkshake","甜甜圈","donut","马卡龙","macaron","含糖饮料","甜品","糖果","蜜饯"], 14, "高糖食品引发血糖剧烈波动"],
  [["啤酒","白酒","红酒","酒精","alcohol","beer","wine","liquor","鸡尾酒","cocktail","烈酒","清酒","烧酒"], 13, "酒精摄入增加炎症水平"],
  [["泡面","方便面","方便食品","instant noodle","快餐","fast food","速食","外卖炸","汉堡","burger","披萨","pizza","热狗","hot dog"], 13, "高度加工食品缺乏营养"],
  [["烧烤","烤串","BBQ","barbecue","grill","炭烤","烤肉","烧肉"], 12, "高温烧烤产生致癌物"],
  [["黄油","猪油","奶油","butter","lard","cream","肥肉","肥","人造黄油","margarine","起酥油","shortening"], 11, "饱和脂肪和反式脂肪促炎"],
  [["辣条","膨化食品","薯片","零食","crisp","chips","cheetos","膨化"], 9, "高盐高脂加工零食"],
  [["白面包","白米饭","白馒头","精制碳水","white bread","white rice","refined carb","白面","面条","拉面"], 5, "精制碳水升糖快"],
]

// Activity scores
const ACTIVITY_SCORES: Record<ActivityType, { base: number; emoji: string; label: string }> = {
  exercise: { base: 25, emoji: "🏃", label: "运动" },
  outdoor: { base: 18, emoji: "🌿", label: "户外" },
  creative: { base: 15, emoji: "🎨", label: "创作" },
  social: { base: 12, emoji: "👥", label: "社交" },
  study: { base: 10, emoji: "📚", label: "学习" },
  work: { base: 5, emoji: "💼", label: "工作" },
  rest: { base: 15, emoji: "😴", label: "休息" },
  other: { base: 8, emoji: "📝", label: "其他" },
}

export function analyzeMeal(content: string): Analysis {
  const text = content.toLowerCase()
  let score = 45
  const goodFindings: string[] = []
  const concerns: string[] = []

  for (const [keywords, bonus, finding] of ANTI_INFLAMMATORY) {
    if (keywords.some((k) => text.includes(k))) {
      goodFindings.push(finding)
      score += bonus
    }
  }

  for (const [keywords, penalty, concern] of PRO_INFLAMMATORY) {
    if (keywords.some((k) => text.includes(k))) {
      concerns.push(concern)
      score -= penalty
    }
  }

  // combo: protein + veggies = bonus
  const hasProtein = ANTI_INFLAMMATORY[0][0].concat(ANTI_INFLAMMATORY[7][0], ANTI_INFLAMMATORY[11][0]).some((k) => text.includes(k))
  const hasVeggies = ANTI_INFLAMMATORY[1][0].some((k) => text.includes(k))
  const hasGrain = ANTI_INFLAMMATORY[8][0].some((k) => text.includes(k))
  if (hasProtein && hasVeggies && hasGrain) {
    score += 8
    goodFindings.push("一餐包含蛋白质+蔬菜+主食，搭配均衡")
  } else if (hasProtein && hasVeggies) {
    score += 5
    goodFindings.push("蛋白质搭配蔬菜，结构不错")
  }

  score = Math.max(10, Math.min(98, score))

  let rating: Analysis["rating"] = "ok"
  if (score >= 70) rating = "good"
  if (score < 40) rating = "caution"

  const uniqueGood = [...new Set(goodFindings)].slice(0, 4)
  const uniqueBad = [...new Set(concerns)].slice(0, 4)

  const tips: Record<Analysis["rating"], string> = {
    good: "搭配得很好！继续保持这样的饮食结构，每餐多样化为佳。",
    ok: "还有提升空间。试试加一份深色蔬菜，或者把白米饭换成糙米。",
    caution: "这餐促炎风险较高。建议减少油炸和加工食品，多加蔬菜和优质蛋白。",
  }

  return { score, rating, goodFindings: uniqueGood, concerns: uniqueBad, suggestion: tips[rating] }
}

export function analyzeActivity(activity: Activity): number {
  return ACTIVITY_SCORES[activity.type]?.base || 5
}

export function getActivityScore(activities: Activity[]): number {
  if (activities.length === 0) return 0
  // variety bonus: different activity types
  const types = new Set(activities.map((a) => a.type))
  const baseTotal = activities.reduce((sum, a) => sum + analyzeActivity(a), 0)
  const varietyBonus = Math.min(types.size * 5, 20)
  return Math.min(baseTotal + varietyBonus, 100)
}

export function predictMood(foodScore: number, activityScore: number, activityCount: number): MoodResult {
  const combined = (foodScore * 0.6 + activityScore * 0.4)

  if (combined >= 75 && activityCount >= 2) {
    return { emoji: "😊", label: "Energized", labelCN: "元气满满", summary: "饮食和活动都很棒，今天状态应该很好！" }
  }
  if (combined >= 65) {
    return { emoji: "😌", label: "Content", labelCN: "舒适满足", summary: "整体不错，身心都比较平衡的一天。" }
  }
  if (combined >= 50) {
    return { emoji: "😐", label: "Neutral", labelCN: "平平淡淡", summary: "中规中矩的一天，稍微调整一下饮食或加点运动会更好。" }
  }
  if (combined >= 35) {
    return { emoji: "😅", label: "Tired", labelCN: "有点疲惫", summary: "饮食或活动可以优化一下，明天会更好。" }
  }
  else {
    return { emoji: "😫", label: "Stressed", labelCN: "需要关注", summary: "今天饮食和活动都不太理想，试试明天来份沙拉加散步。" }
  }
}

export function getDailyWellness(foodContents: string[], activities: Activity[]): DailyWellness {
  const foodScore = foodContents.length === 0 ? 0 : Math.round(
    foodContents.reduce((sum, c) => sum + analyzeMeal(c).score, 0) / foodContents.length
  )
  const activityScore = getActivityScore(activities)
  // food is the base, activities add a bonus (up to +20)
  const activityBonus = Math.round(activityScore * 0.5)
  const wellnessScore = foodContents.length === 0 && activities.length === 0 ? 0
    : Math.round(foodScore + activityBonus)
  const mood = predictMood(foodScore, activityScore, activities.length)

  let rating: Analysis["rating"] = "ok"
  if (wellnessScore >= 70) rating = "good"
  if (wellnessScore < 40) rating = "caution"

  return { foodScore, activityScore, wellnessScore, mood, rating }
}

// Weekly summary
export interface DaySummary {
  date: string
  wellnessScore: number
  foodCount: number
  activityCount: number
}

export function getWeekSummaries(): DaySummary[] {
  const result: DaySummary[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const meals = JSON.parse(localStorage.getItem("qifen-meals") || "[]").filter((m: any) => m.date === dateStr)
    const activities = JSON.parse(localStorage.getItem("qifen-activities") || "[]").filter((a: any) => a.date === dateStr)
    const foodScore = meals.length === 0 ? 0 : Math.round(meals.reduce((sum: number, m: any) => sum + analyzeMeal(m.content).score, 0) / meals.length)
    const activityScore = getActivityScore(activities)
    const wellnessScore = (meals.length === 0 && activities.length === 0) ? 0 : Math.round(foodScore + Math.round(activityScore * 0.5))
    result.push({ date: dateStr, wellnessScore, foodCount: meals.length, activityCount: activities.length })
  }
  return result
}

export function getActivityTypes(): { type: ActivityType; emoji: string; label: string }[] {
  return Object.entries(ACTIVITY_SCORES).map(([type, info]) => ({
    type: type as ActivityType, emoji: info.emoji, label: info.label,
  }))
}
