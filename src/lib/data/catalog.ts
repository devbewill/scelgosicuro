import "server-only"

import { createClient } from "@/lib/supabase/server"

export type Sector = {
  id: string
  slug: string
  name: string
}

export async function getSectors(): Promise<Sector[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sectors")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) throw new Error(`Failed to load sectors: ${error.message}`)
  return data ?? []
}
