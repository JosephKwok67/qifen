import { NextResponse } from "next/server"

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ""
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: "内容为空" }, { status: 400 })

    if (!DEEPSEEK_KEY) {
      // No API key configured — fallback to local analyzer
      const { analyzeMeal } = await import("@/lib/analyzer")
      return NextResponse.json(analyzeMeal(content))
    }

    const prompt = `你是一个专业的抗炎饮食营养师。请分析以下食物，从抗炎饮食角度给出评估。

食物：${content}

请严格按照以下JSON格式返回（不要加markdown代码块，纯JSON）：
{
  "score": 0-100的整数,
  "rating": "good/ok/caution",
  "goodFindings": ["发现1", "发现2"],
  "concerns": ["问题1", "问题2"],
  "suggestion": "一句话改善建议"
}

分析标准：
- 富含Omega-3（深海鱼）、抗氧化物（深色蔬菜水果）、全谷物、发酵食品 = 加分
- 高温油炸、加工肉制品、高糖食品、酒精 = 扣分
- 搭配均衡（有蛋白+蔬菜+主食）= 额外加分`

    const resp = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!resp.ok) {
      const { analyzeMeal } = await import("@/lib/analyzer")
      return NextResponse.json({ ...analyzeMeal(content), source: "local-fallback" })
    }

    const data = await resp.json()
    const text = data.choices?.[0]?.message?.content || ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      const { analyzeMeal } = await import("@/lib/analyzer")
      return NextResponse.json({ ...analyzeMeal(content), source: "local-fallback" })
    }

    return NextResponse.json({ ...JSON.parse(jsonMatch[0]), source: "deepseek" })
  } catch {
    const { analyzeMeal } = await import("@/lib/analyzer")
    const text = ""; return NextResponse.json({ ...analyzeMeal(text), source: "local-fallback" })
  }
}
