import { NextResponse, type NextRequest } from "next/server"
import pool from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

type MediaRow = RowDataPacket & {
  media_mime: string | null
  media_blob: Buffer | null
}

async function ensureDailyPostsTable() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS daily_posts (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT NOT NULL, media_type ENUM('none','image','video') NOT NULL DEFAULT 'none', media_mime VARCHAR(64) NULL, media_blob LONGBLOB NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_created_at (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  )
}

export async function GET(request: NextRequest) {
  await ensureDailyPostsTable()
  const idRaw = request.nextUrl.searchParams.get("id") ?? ""
  const id = Number(idRaw)
  if (!Number.isFinite(id) || id <= 0) {
    return new NextResponse("Invalid id", { status: 400 })
  }

  const [rows] = await pool.query<MediaRow[]>(
    "SELECT media_mime, media_blob FROM daily_posts WHERE id = ? LIMIT 1",
    [id]
  )
  const item = Array.isArray(rows) ? rows[0] : null
  const blob = item?.media_blob ?? null
  if (!blob) {
    return new NextResponse("Not found", { status: 404 })
  }

  return new NextResponse(new Uint8Array(blob), {
    headers: {
      "Content-Type": item?.media_mime || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
