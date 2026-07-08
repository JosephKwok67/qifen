export interface EncourageMsg {
  emoji: string
  title: string
  body: string
}

export function getEncourage(dailyRecords: number, streak: number, score: number): EncourageMsg | null {
  if (dailyRecords === 0) return null

  const isFirstToday = dailyRecords === 1

  // First record of the day
  if (isFirstToday && streak <= 1) {
    const msgs = [
      { emoji: "🌱", title: "好的开始！", body: "记录下第一餐，今天迈出了第一步。坚持就是胜利。" },
      { emoji: "✨", title: "记录成功！", body: "每一次记录都是对自己的关照，你今天做得很好。" },
      { emoji: "💪", title: "不错哦！", body: "开始留意自己吃了什么，就是健康的第一步。" },
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }

  // Multiple records today
  if (dailyRecords >= 3 && streak >= 1 && streak < 7) {
    const msgs = [
      { emoji: "🔥", title: "今天很认真！", body: "三顿都记录了，你对饮食的关注度越来越高了。" },
      { emoji: "📝", title: "记录达人", body: "一天不落的记录习惯正在养成中，继续保持！" },
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }

  // Weekly achiever (7+ days)
  if (streak >= 7 && streak < 30) {
    const msgs = [
      { emoji: "🏆", title: "一周达成！", body: "连续一周记录饮食和活动，这个习惯已经超过大多数人了。" },
      { emoji: "🌟", title: "坚持之星", body: "七天如一日，你已经把健康变成了日常。了不起。" },
      { emoji: "🎯", title: "自律强者", body: "一周不间断的自我观察，证明你是真的在乎自己的身体。" },
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }

  // Monthly achiever (30+ days)
  if (streak >= 30) {
    const msgs = [
      { emoji: "👑", title: "一个月了！", body: "三十天的坚持不是小事，你已经完全掌控了自己的健康节奏。" },
      { emoji: "💎", title: "稀有成就", body: "能连续一个月记录饮食的人，万里挑一。你值得所有称赞。" },
      { emoji: "🚀", title: "健康大师", body: "从记录到习惯，从习惯到本能。你已经是健康生活方式的代言人了。" },
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }

  // High score bonus
  if (score >= 80) {
    const msgs = [
      { emoji: "🥗", title: "满分饮食！", body: "今天的搭配太棒了，抗炎指数拉满。继续保持这样的饮食结构。" },
      { emoji: "👨‍🍳", title: "饮食高手", body: "这个搭配连营养师都要点赞，你真的很懂怎么吃。" },
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }

  // Default encouragement for any record
  const msgs = [
    { emoji: "👏", title: "又记了一笔", body: "每多一次记录，就多一分对自己身体的了解。干得好。" },
    { emoji: "🎉", title: "不错不错", body: "今天的记录又丰富了，继续加油！" },
  ]
  return msgs[Math.floor(Math.random() * msgs.length)]
}
