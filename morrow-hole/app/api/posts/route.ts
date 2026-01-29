import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

type PostRow = RowDataPacket & {
  id: number
  title: string
  summary: string
  slug: string
  created_at: string
}

export async function GET() {
  const [rows] = await pool.query<PostRow[]>(
    "SELECT id, title, summary, slug, created_at FROM posts ORDER BY created_at DESC"
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}
