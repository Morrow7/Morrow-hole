import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

type PostRow = RowDataPacket & {
  id: number
  title: string
  summary: string
  slug: string
  created_at: string
}

export async function GET(request: NextRequest) {
  const limitRaw = request.nextUrl.searchParams.get("limit")
  const offsetRaw = request.nextUrl.searchParams.get("offset")
  const limit = Math.min(100, Math.max(1, Number(limitRaw ?? 24) || 24))
  const offset = Math.max(0, Number(offsetRaw ?? 0) || 0)

  const pool = getPool()
  const [rows] = await pool.query<PostRow[]>(
    "SELECT id, title, summary, slug, created_at FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}
