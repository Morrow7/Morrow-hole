import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

type FriendLink = RowDataPacket & {
  name: string
  url: string
  desc: string
}

export async function GET() {
  const pool = getPool()
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
