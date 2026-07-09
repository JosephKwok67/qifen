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

const MEAL_PHOTOS_BUCKET = "meal-photos"

export async function uploadMealPhoto(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })
  if (error) {
    console.error("上传图片失败:", error.message)
    return null
  }
  const { data } = supabase.storage.from(MEAL_PHOTOS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteMealPhoto(photoUrl: string): Promise<void> {
  if (!photoUrl || !photoUrl.includes(`/${MEAL_PHOTOS_BUCKET}/`)) return
  const path = photoUrl.split(`/${MEAL_PHOTOS_BUCKET}/`)[1]
  if (!path) return
  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).remove([path])
  if (error) {
    console.warn("删除云端图片失败:", error.message)
  }
}
