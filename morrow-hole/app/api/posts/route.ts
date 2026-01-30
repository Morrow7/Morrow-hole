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

type LikeRow = RowDataPacket & {
  id: number
  post_slug: string
  client_id: string
  author: string
  avatar_url: string | null
  created_at: string
}

async function ensureCommentsTable() {
  const pool = getPool()
  await pool.query(
    "CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, post_slug VARCHAR(128) NOT NULL, author VARCHAR(64) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_post_slug (post_slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

async function ensureLikesTable() {
  const pool = getPool()
  await pool.query(
    "CREATE TABLE IF NOT EXISTS likes (id INT AUTO_INCREMENT PRIMARY KEY, post_slug VARCHAR(128) NOT NULL, client_id VARCHAR(128) NOT NULL, author VARCHAR(64) NOT NULL, avatar_url VARCHAR(512) NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_like (post_slug, client_id), INDEX idx_post_slug (post_slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
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
  const includeLikesRaw = (request.nextUrl.searchParams.get("includeLikes") ?? "").trim().toLowerCase()
  const includeLikes =
    includeLikesRaw === "1" ||
    includeLikesRaw === "true" ||
    includeLikesRaw === "yes"

  const pool = getPool()
  const [rows] = await pool.query<PostRow[]>(
    "SELECT id, title, summary, slug, created_at FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  )
  const items = Array.isArray(rows) ? rows : []

  if (!includeComments && !includeLikes) {
    return NextResponse.json({ items })
  }

  const slugs = items.map(r => r.slug).filter(Boolean)
  if (slugs.length === 0) return NextResponse.json({ items })

  const placeholders = slugs.map(() => "?").join(",")
  const commentMap = new Map<string, CommentRow[]>()
  const likeMap = new Map<string, LikeRow[]>()

  if (includeComments) {
    await ensureCommentsTable()
    const [commentRows] = await pool.query<CommentRow[]>(
      `SELECT id, post_slug, author, content, created_at FROM comments WHERE post_slug IN (${placeholders}) ORDER BY created_at DESC`,
      slugs
    )
    for (const c of Array.isArray(commentRows) ? commentRows : []) {
      const key = c.post_slug
      const arr = commentMap.get(key)
      if (arr) {
        arr.push(c)
      } else {
        commentMap.set(key, [c])
      }
    }
  }

  if (includeLikes) {
    await ensureLikesTable()
    const [likeRows] = await pool.query<LikeRow[]>(
      `SELECT id, post_slug, client_id, author, avatar_url, created_at FROM likes WHERE post_slug IN (${placeholders}) ORDER BY created_at DESC`,
      slugs
    )
    for (const l of Array.isArray(likeRows) ? likeRows : []) {
      const key = l.post_slug
      const arr = likeMap.get(key)
      if (arr) {
        arr.push(l)
      } else {
        likeMap.set(key, [l])
      }
    }
  }

  return NextResponse.json({
    items: items.map(p => ({
      ...p,
      ...(includeComments ? { comments: commentMap.get(p.slug) ?? [] } : null),
      ...(includeLikes ? { likes: likeMap.get(p.slug) ?? [] } : null)
    }))
  })
}
