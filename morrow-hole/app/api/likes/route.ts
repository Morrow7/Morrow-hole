import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import { requireGithubUser } from "@/lib/githubAuth"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

type LikeRow = RowDataPacket & {
  id: number
  post_slug: string
  client_id: string
  author: string
  avatar_url: string | null
  created_at: string
}

async function ensureLikesTable() {
  const pool = getPool()
  await pool.query(
    "CREATE TABLE IF NOT EXISTS likes (id INT AUTO_INCREMENT PRIMARY KEY, post_slug VARCHAR(128) NOT NULL, client_id VARCHAR(128) NOT NULL, author VARCHAR(64) NOT NULL, avatar_url VARCHAR(512) NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_like (post_slug, client_id), INDEX idx_post_slug (post_slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

export async function GET(request: NextRequest) {
  const slugRaw = request.nextUrl.searchParams.get("slug") ?? ""
  const slug = decodeURIComponent(slugRaw).trim()
  if (!slug) return NextResponse.json({ items: [] })
  await ensureLikesTable()
  const pool = getPool()
  const [rows] = await pool.query<LikeRow[]>(
    "SELECT id, post_slug, client_id, author, avatar_url, created_at FROM likes WHERE post_slug = ? ORDER BY created_at DESC",
    [slug]
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireGithubUser(request)
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const slugRaw = typeof body?.slug === "string" ? body.slug : ""
  const actionRaw = typeof body?.action === "string" ? body.action : ""

  const slug = decodeURIComponent(slugRaw).trim()
  const clientId = auth.user.login.trim().slice(0, 128)
  const author = ((auth.user.name ?? "").trim() || auth.user.login).slice(0, 64)
  const avatarUrl = auth.user.avatarUrl.trim().slice(0, 512)
  const action = actionRaw.trim().toLowerCase()

  if (!slug) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
  }

  await ensureLikesTable()
  const pool = getPool()
  const [rows] = await pool.query<LikeRow[]>(
    "SELECT id FROM likes WHERE post_slug = ? AND client_id = ? LIMIT 1",
    [slug, clientId]
  )
  const exists = Array.isArray(rows) && rows.length > 0

  if ((action === "unlike" && exists) || (action === "like" && !exists) || action === "") {
    if (exists) {
      const likeId = rows[0].id
      await pool.query<ResultSetHeader>("DELETE FROM likes WHERE id = ? LIMIT 1", [likeId])
    } else {
      await pool.query<ResultSetHeader>(
        "INSERT INTO likes (post_slug, client_id, author, avatar_url) VALUES (?, ?, ?, ?)",
        [slug, clientId, author, avatarUrl || null]
      )
    }
  }

  const [countRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM likes WHERE post_slug = ?",
    [slug]
  )
  const count = Number((Array.isArray(countRows) ? countRows[0]?.c : 0) ?? 0) || 0
  const [likedRows] = await pool.query<RowDataPacket[]>(
    "SELECT 1 as ok FROM likes WHERE post_slug = ? AND client_id = ? LIMIT 1",
    [slug, clientId]
  )
  const liked = Array.isArray(likedRows) && likedRows.length > 0

  return NextResponse.json({ liked, count })
}
