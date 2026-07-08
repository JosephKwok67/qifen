export interface RecipeStep {
  emoji: string
  text: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  tags: string[]
  time: string
  difficulty: string
  ingredients: string[]
  steps: RecipeStep[]
  videoUrl: string
  healthScore: number
  calories: string
}

export const RECIPES: Recipe[] = [
  {
    id: "asparagus-steak",
    title: "芦笋土豆牛扒",
    description: "优质牛肉搭配芦笋和土豆，高蛋白高纤维，用橄榄油煎制，简单三步做出餐厅级健康餐。",
    tags: ["高蛋白", "抗炎", "低GI"],
    time: "25分钟",
    difficulty: "中等",
    ingredients: ["牛里脊 150g", "芦笋 6根", "小土豆 3个", "橄榄油 1勺", "蒜 2瓣", "黑胡椒、海盐适量"],
    steps: [
      { emoji: "🥩", text: "牛排提前10分钟取出回温，两面撒海盐黑胡椒。土豆切块水煮8分钟，芦笋去老根。" },
      { emoji: "🍳", text: "热锅加橄榄油，大火煎牛排每面2分钟（五分熟），取出静置。同锅炒蒜瓣、土豆至金黄。" },
      { emoji: "🍽️", text: "牛排斜切成片，与土豆、芦笋装盘。淋上锅中余汁，搭配柠檬角即可。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 85,
    calories: "420千卡",
  },
  {
    id: "chicken-avocado",
    title: "鸡胸肉牛油果沙拉",
    description: "低脂高蛋白鸡胸肉 + 牛油果的健康脂肪 + 混合蔬菜，一道完美的减脂增肌午餐。",
    tags: ["低卡", "高蛋白", "减脂"],
    time: "15分钟",
    difficulty: "简单",
    ingredients: ["鸡胸肉 120g", "牛油果 1个", "混合生菜 100g", "小番茄 8个", "柠檬汁 1勺", "橄榄油、盐、黑胡椒适量"],
    steps: [
      { emoji: "🍗", text: "鸡胸肉横切薄片，用盐、黑胡椒、少许橄榄油腌制5分钟。平底锅中火每面煎3分钟至金黄。" },
      { emoji: "🥑", text: "牛油果对半切开去核，切成薄片。小番茄对半切，生菜洗净沥干撕成小片。" },
      { emoji: "🥗", text: "生菜铺底，码上鸡胸肉片、牛油果和小番茄。淋橄榄油和柠檬汁，撒少许海盐即可。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 82,
    calories: "380千卡",
  },
  {
    id: "salmon-quinoa",
    title: "三文鱼藜麦碗",
    description: "富含Omega-3的烤三文鱼搭配藜麦和烤蔬菜，抗炎指数拉满的一碗。",
    tags: ["抗炎", "Omega-3", "高蛋白"],
    time: "30分钟",
    difficulty: "中等",
    ingredients: ["三文鱼排 150g", "藜麦 80g", "西兰花 100g", "胡萝卜 1根", "酱油 1勺", "蜂蜜 半勺", "姜末适量"],
    steps: [
      { emoji: "🐟", text: "藜麦加水煮15分钟至发芽状。三文鱼用酱油+蜂蜜+姜末腌制10分钟。" },
      { emoji: "🔥", text: "烤箱200°C预热，三文鱼和西兰花、胡萝卜一起烤12-15分钟至表面微焦。" },
      { emoji: "🥣", text: "碗底铺藜麦，放上三文鱼和烤蔬菜。淋少许柠檬汁和橄榄油提鲜。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 90,
    calories: "450千卡",
  },
  {
    id: "broccoli-shrimp",
    title: "西兰花炒虾仁",
    description: "经典粤式家常菜，虾仁高蛋白低脂，西兰花抗氧化物丰富，十分钟快手健康菜。",
    tags: ["低卡", "高蛋白", "快手菜"],
    time: "10分钟",
    difficulty: "简单",
    ingredients: ["鲜虾仁 200g", "西兰花 200g", "蒜 3瓣", "姜 2片", "料酒 1勺", "盐、白胡椒粉适量"],
    steps: [
      { emoji: "🦐", text: "虾仁去虾线，用料酒、白胡椒粉腌5分钟。西兰花掰小朵，开水焯1分钟捞出。" },
      { emoji: "🔥", text: "热锅少油，爆香蒜末姜片，下虾仁大火翻炒至变色卷曲，盛出备用。" },
      { emoji: "🥬", text: "同锅下西兰花翻炒1分钟，倒回虾仁，加盐调味，快速翻炒均匀即可出锅。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 78,
    calories: "220千卡",
  },
  {
    id: "tomato-tofu-soup",
    title: "番茄豆腐蛋花汤",
    description: "暖胃低卡的经典汤品，番茄的番茄红素+豆腐的植物蛋白，抗炎暖身首选。",
    tags: ["低卡", "素食", "抗炎"],
    time: "15分钟",
    difficulty: "简单",
    ingredients: ["番茄 2个", "嫩豆腐 1盒", "鸡蛋 1个", "葱花适量", "盐、白胡椒粉、香油少许"],
    steps: [
      { emoji: "🍅", text: "番茄切块，热锅少许油炒软出汁。加两碗水煮开，豆腐切小块放入。" },
      { emoji: "🥚", text: "中火煮3分钟，鸡蛋打散沿锅边淋入，不要搅动，等蛋花浮起。" },
      { emoji: "🍲", text: "加盐和白胡椒粉调味，撒葱花、淋几滴香油，趁热享用。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 75,
    calories: "180千卡",
  },
  {
    id: "oats-blueberry",
    title: "隔夜燕麦蓝莓杯",
    description: "提前一晚准备，早上直接吃。燕麦+酸奶+蓝莓，满满的膳食纤维和抗氧化物。",
    tags: ["高纤维", "抗炎", "快手"],
    time: "5分钟（需隔夜）",
    difficulty: "简单",
    ingredients: ["燕麦片 50g", "希腊酸奶 100g", "牛奶 100ml", "蓝莓 50g", "奇亚籽 1勺", "蜂蜜少许"],
    steps: [
      { emoji: "🥣", text: "杯中混合燕麦片、酸奶、牛奶和奇亚籽，搅拌均匀。盖上保鲜膜。" },
      { emoji: "🌙", text: "放入冰箱冷藏过夜（至少6小时），让燕麦充分吸收液体变软糯。" },
      { emoji: "🫐", text: "早上取出，铺上新鲜蓝莓，淋少许蜂蜜。冷吃或微波30秒热吃都可以。" },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    healthScore: 80,
    calories: "320千卡",
  },
]
