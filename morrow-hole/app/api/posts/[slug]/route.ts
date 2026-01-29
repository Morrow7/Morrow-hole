import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"
import { promises as fs } from "node:fs"
import path from "node:path"

type PostRow = RowDataPacket & {
  title: string
  md_path: string
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const pool = getPool()
  const { slug: slugRaw } = await context.params
  let slug = slugRaw
  try {
    slug = decodeURIComponent(slug)
  } catch {
    slug = slugRaw
  }
  const [rows] = await pool.query<PostRow[]>(
    "SELECT title, md_path FROM posts WHERE slug = ? LIMIT 1",
    [slug]
  )
  const post = Array.isArray(rows) ? rows[0] : null

  if (!post) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  let content = ""
  const mdPath = post.md_path

  try {
    const isHttp = /^https?:\/\//i.test(mdPath)
    let filePath = mdPath
    const publicDir = path.join(process.cwd(), "public")
    const normalizeBase = (s: string) =>
      path.basename(s, path.extname(s)).toLowerCase().replace(/\s+/g, "").replace(/和/g, "与")
    const resolveLocal = async (name: string) => {
      const candidates = [
        name,
        decodeURIComponent(name),
        name.replace(/和/g, "与"),
        name.replace(/与/g, "和"),
      ].map(n => n.replace(/^[\\/]+/, ""))
      for (const n of candidates) {
        const p = path.join(publicDir, n)
        try {
          await fs.access(p)
          return p
        } catch { }
      }
      try {
        const files = await fs.readdir(publicDir)
        const target = files.find(f => normalizeBase(f) === normalizeBase(name))
        if (target) return path.join(publicDir, target)
      } catch { }
      return null
    }

    if (isHttp) {
      try {
        const url = new URL(encodeURI(mdPath))
        const pathname = decodeURIComponent(url.pathname || "")
        const name = pathname.replace(/^[\\/]+/, "")
        const local = await resolveLocal(name)
        filePath = local ?? path.join(publicDir, name)
      } catch {
        const name = mdPath.replace(/^https?:\/\/[^/]+/i, "").replace(/^[\\/]+/, "")
        const local = await resolveLocal(name)
        filePath = local ?? path.join(publicDir, name)
      }
    } else if (!/^[a-zA-Z]:\\/.test(mdPath) && !mdPath.startsWith("\\\\")) {
      const name = mdPath.replace(/^[\\/]+/, "")
      const local = await resolveLocal(name)
      filePath = local ?? path.join(publicDir, name)
    }

    try {
      content = await fs.readFile(filePath, "utf-8")
      return NextResponse.json({ title: post.title, content, source: "local" })
    } catch {
      if (!isHttp) {
        return NextResponse.json({ message: "Read failed", reason: "local", filePath }, { status: 500 })
      }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(encodeURI(mdPath), { signal: controller.signal })
        if (!res.ok) {
          return NextResponse.json({ message: "Read failed", reason: "remote", status: res.status }, { status: res.status })
        }
        content = await res.text()
        return NextResponse.json({ title: post.title, content, source: "remote" })
      } finally {
        clearTimeout(timeoutId)
      }
    }
  } catch {
    return NextResponse.json({ message: "Read failed", reason: "unknown" }, { status: 500 })
  }
}
