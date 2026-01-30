import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import path from "node:path"

type DailyPostRow = RowDataPacket & {
  id: number
  content: string
  media_type: "none" | "image" | "video"
  created_at: string
  author: string
  likes_count: number
  comments_count: number
  has_media: 0 | 1
}

const IMAGE_MIME_ALLOW = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const VIDEO_MIME_ALLOW = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
])

const IMAGE_EXT_ALLOW = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"])
const VIDEO_EXT_ALLOW = new Set([".mp4", ".webm", ".ogv", ".ogg"])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

async function requireGithubAuth(request: NextRequest) {
  const rawAuth = request.headers.get("authorization") ?? ""
  const token = rawAuth.startsWith("Bearer ")
    ? rawAuth.slice("Bearer ".length).trim()
    : rawAuth.startsWith("token ")
      ? rawAuth.slice("token ".length).trim()
      : ""

  if (!token) {
    return { ok: false as const, response: NextResponse.json({ message: "missing_token" }, { status: 401 }) }
  }

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 401) {
      return { ok: false as const, response: NextResponse.json({ message: "invalid_token" }, { status: 401 }) }
    }
    return {
      ok: false as const,
      response: NextResponse.json({ message: "github_request_failed", status: res.status }, { status: 502 }),
    }
  }

  return { ok: true as const }
}

async function ensureDailyPostsTable() {
  const pool = getPool()
  await pool.query(
    "CREATE TABLE IF NOT EXISTS daily_posts (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT NOT NULL, media_type ENUM('none','image','video') NOT NULL DEFAULT 'none', media_mime VARCHAR(64) NULL, media_blob LONGBLOB NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_created_at (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

export async function GET() {
  await ensureDailyPostsTable()
  const pool = getPool()
  const [rows] = await pool.query<DailyPostRow[]>(
    "SELECT id, content, media_type, created_at, CASE WHEN media_blob IS NULL THEN 0 ELSE 1 END AS has_media FROM daily_posts ORDER BY created_at DESC LIMIT 50"
  )
  return NextResponse.json({ items: Array.isArray(rows) ? rows : [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireGithubAuth(request)
  if (!auth.ok) return auth.response

  await ensureDailyPostsTable()
  const pool = getPool()

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

    if (mediaType !== "none") {
      if (!file || typeof file === "string") {
        return NextResponse.json({ message: "missing_file" }, { status: 400 })
      }

      const mime = typeof file.type === "string" ? file.type : ""
      const ext = path.extname(file.name ?? "").toLowerCase()
      const size = typeof file.size === "number" ? file.size : 0
      const maxSize = mediaType === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
      if (size > maxSize) {
        return NextResponse.json({ message: "file_too_large", maxBytes: maxSize }, { status: 413 })
      }

      if (mediaType === "image") {
        if ((mime && !IMAGE_MIME_ALLOW.has(mime)) && !IMAGE_EXT_ALLOW.has(ext)) {
          return NextResponse.json({ message: "unsupported_media_type", mediaType, mime, ext }, { status: 415 })
        }
      } else if (mediaType === "video") {
        if ((mime && !VIDEO_MIME_ALLOW.has(mime)) && !VIDEO_EXT_ALLOW.has(ext)) {
          return NextResponse.json({ message: "unsupported_media_type", mediaType, mime, ext }, { status: 415 })
        }
      }

      const ab = await file.arrayBuffer()
      mediaBlob = Buffer.from(ab)
      mediaMime = mime || null
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
