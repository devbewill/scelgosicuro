import "server-only"

import { createClient } from "@/lib/supabase/server"

export type Sector = {
  id: string
  name: string
}

export type Activity = {
  id: string
  sectorId: string
  name: string
}

export async function getSectors(): Promise<Sector[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sectors")
    .select("id, name")
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error(`Failed to load sectors: ${error.message}`)
  }
  return data ?? []
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("id, sector_id, name")
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error(`Failed to load activities: ${error.message}`)
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    sectorId: row.sector_id,
    name: row.name,
  }))
}
