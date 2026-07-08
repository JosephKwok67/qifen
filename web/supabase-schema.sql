-- 七分数据库表结构
-- 在 Supabase SQL Editor 中执行

-- 用户档案表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nickname TEXT DEFAULT '七分用户',
  title TEXT DEFAULT '健康新手',
  region TEXT DEFAULT '广州',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 饮食记录表
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT CHECK (type IN ('breakfast','lunch','dinner','snack')),
  content TEXT NOT NULL,
  photo TEXT DEFAULT '',
  score INTEGER DEFAULT 50,
  analysis JSONB DEFAULT '{}',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 活动记录表
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 菜谱分享表
CREATE TABLE shared_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  time TEXT DEFAULT '自定义',
  difficulty TEXT DEFAULT '中等',
  ingredients TEXT[] DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  video_url TEXT DEFAULT '',
  health_score INTEGER DEFAULT 70,
  calories TEXT DEFAULT '自定义',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_activities_user_date ON activities(user_id, date);
CREATE INDEX idx_recipes_user ON shared_recipes(user_id);

-- RLS 策略（用户只能看自己的数据）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles USING (auth.uid() = id);
CREATE POLICY "own_meals" ON meals USING (auth.uid() = user_id);
CREATE POLICY "own_activities" ON activities USING (auth.uid() = user_id);
CREATE POLICY "read_all_recipes" ON shared_recipes FOR SELECT USING (true);
CREATE POLICY "own_recipes" ON shared_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 排行榜视图
CREATE VIEW leaderboard AS
SELECT
  p.nickname,
  p.title,
  p.region,
  COALESCE(AVG(m.score), 0) AS avg_food_score,
  COUNT(DISTINCT m.id) AS meal_count,
  COUNT(DISTINCT a.id) AS activity_count,
  COUNT(DISTINCT sr.id) AS recipe_count,
  ROUND(COALESCE(AVG(m.score), 0) + LEAST(COUNT(DISTINCT sr.id) * 3, 15)) AS total_score
FROM profiles p
LEFT JOIN meals m ON m.user_id = p.id AND m.date = CURRENT_DATE
LEFT JOIN activities a ON a.user_id = p.id AND a.date = CURRENT_DATE
LEFT JOIN shared_recipes sr ON sr.user_id = p.id
GROUP BY p.id, p.nickname, p.title, p.region
ORDER BY total_score DESC;
