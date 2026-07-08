import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface DBMeal {
  id: string
  user_id: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  content: string
  photo: string
  score: number
  analysis: any
  created_at: string
}

export interface DBActivity {
  id: string
  user_id: string
  type: string
  content: string
  created_at: string
}
