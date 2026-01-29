import { NextResponse, type NextRequest } from "next/server"
import pool from "@/lib/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

type DailyPostRow = RowDataPacket & {
  id: number
  content: string
  media_type: "none" | "image" | "video"
  created_at: string
  author:string
  likes_count: number
  comments_count: number
  has_media: 0 | 1
}

async function ensureDailyPostsTable() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS daily_posts (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT NOT NULL, media_type ENUM('none','image','video') NOT NULL DEFAULT 'none', media_mime VARCHAR(64) NULL, media_blob LONGBLOB NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_created_at (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

export async function GET() {
  await ensureDailyPostsTable()
  const [rows] = await pool.query<DailyPostRow[]>(
    "SELECT id, content, media_type, created_at, CASE WHEN media_blob IS NULL THEN 0 ELSE 1 END AS has_media FROM daily_posts ORDER BY created_at DESC LIMIT 50"
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}

export async function POST(request: NextRequest) {
  await ensureDailyPostsTable()

  const contentType = request.headers.get("content-type") ?? ""
  let content = ""
  let mediaType: "none" | "image" | "video" = "none"
  let mediaMime: string | null = null
  let mediaBlob: Buffer | null = null

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const textRaw = typeof form.get("text") === "string" ? String(form.get("text")) : ""
    const modeRaw = typeof form.get("mode") === "string" ? String(form.get("mode")) : "text"
    const file = form.get("file")

    content = textRaw.trim()
    mediaType = modeRaw === "image" ? "image" : modeRaw === "video" ? "video" : "none"

    if (file && typeof file !== "string") {
      const mime = typeof file.type === "string" ? file.type : ""
      const ab = await file.arrayBuffer()
      mediaBlob = Buffer.from(ab)
      mediaMime = mime || null
    } else {
      mediaType = "none"
    }
  } else {
    const body = await request.json().catch(() => null)
    const textRaw = typeof body?.text === "string" ? body.text : ""
    content = textRaw.trim()
    mediaType = "none"
  }

  if (!content && !mediaBlob) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
  }

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO daily_posts (content, media_type, media_mime, media_blob) VALUES (?, ?, ?, ?)",
    [content, mediaType, mediaMime, mediaBlob]
  )
  const insertId = result.insertId
  const [rows] = await pool.query<DailyPostRow[]>(
    "SELECT id, content, media_type, created_at, CASE WHEN media_blob IS NULL THEN 0 ELSE 1 END AS has_media FROM daily_posts WHERE id = ? LIMIT 1",
    [insertId]
  )
  const item = Array.isArray(rows) ? rows[0] : null
  return NextResponse.json({ item })
}
