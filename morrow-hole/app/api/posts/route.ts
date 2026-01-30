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
  const limitRaw = request.nextUrl.searchParams.get("limit")
  const offsetRaw = request.nextUrl.searchParams.get("offset")
  const limit = Math.min(100, Math.max(1, Number(limitRaw ?? 24) || 24))
  const offset = Math.max(0, Number(offsetRaw ?? 0) || 0)
  const includeCommentsRaw = (request.nextUrl.searchParams.get("includeComments") ?? "").trim().toLowerCase()
  const includeComments =
    includeCommentsRaw === "1" ||
    includeCommentsRaw === "true" ||
    includeCommentsRaw === "yes"

  const pool = getPool()
  const [rows] = await pool.query<PostRow[]>(
    "SELECT id, title, summary, slug, created_at FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  )
  const items = Array.isArray(rows) ? rows : []

  if (!includeComments) {
    return NextResponse.json({ items })
  }

  await ensureCommentsTable()
  const slugs = items.map(r => r.slug).filter(Boolean)
  if (slugs.length === 0) {
    return NextResponse.json({ items: items.map(p => ({ ...p, comments: [] })) })
  }

  const placeholders = slugs.map(() => "?").join(",")
  const [commentRows] = await pool.query<CommentRow[]>(
    `SELECT id, post_slug, author, content, created_at FROM comments WHERE post_slug IN (${placeholders}) ORDER BY created_at DESC`,
    slugs
  )

  const map = new Map<string, CommentRow[]>()
  for (const c of Array.isArray(commentRows) ? commentRows : []) {
    const key = c.post_slug
    const arr = map.get(key)
    if (arr) {
      arr.push(c)
    } else {
      map.set(key, [c])
    }
  }

  return NextResponse.json({
    items: items.map(p => ({
      ...p,
      comments: map.get(p.slug) ?? []
    }))
  })
}
