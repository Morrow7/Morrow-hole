import { NextResponse } from "next/server"
import pool from "@/lib/db"

type FriendLink = {
  name: string
  url: string
  desc: string
}

export async function GET() {
  let items: FriendLink[] = []

  try {
    const [rows] = await pool.query<FriendLink[]>(
      "SELECT name, url, `desc` AS `desc` FROM friend_links ORDER BY id ASC"
    )
    items = Array.isArray(rows) ? rows : []
  } catch {
    items = []
  }

  return NextResponse.json({ items })
}
