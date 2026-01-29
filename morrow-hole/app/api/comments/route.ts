import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

type CommentRow = RowDataPacket & {
  id: number
  post_slug: string
  author: string
  content: string
  created_at: string
}

async function ensureCommentsTable() {
  const pool = getPool()
  await pool.query(
    "CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, post_slug VARCHAR(128) NOT NULL, author VARCHAR(64) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_post_slug (post_slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

export async function GET(request: NextRequest) {
  const slugRaw = request.nextUrl.searchParams.get("slug") ?? ""
  const slug = decodeURIComponent(slugRaw)
  if (!slug) {
    return NextResponse.json({ items: [] })
  }
  await ensureCommentsTable()
  const pool = getPool()
  const [rows] = await pool.query<CommentRow[]>(
    "SELECT id, post_slug, author, content, created_at FROM comments WHERE post_slug = ? ORDER BY created_at DESC",
    [slug]
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const slugRaw = typeof body?.slug === "string" ? body.slug : ""
  const nameRaw = typeof body?.name === "string" ? body.name : ""
  const contentRaw = typeof body?.content === "string" ? body.content : ""
  const slug = decodeURIComponent(slugRaw).trim()
  const name = nameRaw.trim().slice(0, 64)
  const content = contentRaw.trim()

  if (!slug || !name || !content) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
  }

  await ensureCommentsTable()
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO comments (post_slug, author, content) VALUES (?, ?, ?)",
    [slug, name, content]
  )
  const insertId = result.insertId
  const [rows] = await pool.query<CommentRow[]>(
    "SELECT id, post_slug, author, content, created_at FROM comments WHERE id = ? LIMIT 1",
    [insertId]
  )
  const item = Array.isArray(rows) ? rows[0] : null
  return NextResponse.json({ item })
}
