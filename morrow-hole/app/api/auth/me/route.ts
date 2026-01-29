import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const rawAuth = request.headers.get("authorization") ?? ""
  const token = rawAuth.startsWith("Bearer ")
    ? rawAuth.slice("Bearer ".length).trim()
    : rawAuth.startsWith("token ")
      ? rawAuth.slice("token ".length).trim()
      : ""

  if (!token) {
    return NextResponse.json({ message: "missing_token" }, { status: 401 })
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
      return NextResponse.json({ message: "invalid_token" }, { status: 401 })
    }
    return NextResponse.json({ message: "github_request_failed", status: res.status }, { status: 502 })
  }

  const data = await res.json().catch(() => null)
  const login = typeof data?.login === "string" ? data.login : ""
  const name = typeof data?.name === "string" ? data.name : null
  const avatarUrl = typeof data?.avatar_url === "string" ? data.avatar_url : ""

  if (!login) {
    return NextResponse.json({ message: "invalid_user" }, { status: 502 })
  }

  return NextResponse.json({ login, name, avatarUrl })
}
