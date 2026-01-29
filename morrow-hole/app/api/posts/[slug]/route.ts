import { NextResponse, type NextRequest } from "next/server"
import pool from "@/lib/db"
import { promises as fs } from "node:fs"
import path from "node:path"

type PostRow = {
  title: string
  md_path: string
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
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

    if (isHttp) {
      try {
        const url = new URL(encodeURI(mdPath))
        const pathname = decodeURIComponent(url.pathname || "")
        const name = pathname.replace(/^[\\/]+/, "")
        filePath = path.join(process.cwd(), "public", name)
      } catch {
        const name = mdPath.replace(/^https?:\/\/[^/]+/i, "").replace(/^[\\/]+/, "")
        filePath = path.join(process.cwd(), "public", name)
      }
    } else if (!/^[a-zA-Z]:\\/.test(mdPath) && !mdPath.startsWith("\\\\")) {
      const name = mdPath.replace(/^[\\/]+/, "")
      filePath = path.join(process.cwd(), "public", name)
    }

    try {
      content = await fs.readFile(filePath, "utf-8")
    } catch {
      if (!isHttp) {
        return NextResponse.json({ message: "Read failed" }, { status: 500 })
      }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(encodeURI(mdPath), { signal: controller.signal })
        if (!res.ok) {
          return NextResponse.json({ message: "Read failed" }, { status: res.status })
        }
        content = await res.text()
      } finally {
        clearTimeout(timeoutId)
      }
    }
  } catch {
    return NextResponse.json({ message: "Read failed" }, { status: 500 })
  }

  return NextResponse.json({ title: post.title, content })
}
