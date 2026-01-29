import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const error = url.searchParams.get("error")
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, url))
  }

  const code = url.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url))
  }

  const clientId = process.env.GITHUB_CLIENT_ID ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? ""
  const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? ""
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=missing_oauth_env", url))
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=token_request_failed", url))
  }

  const data = await tokenRes.json().catch(() => null)
  const token = typeof data?.access_token === "string" ? data.access_token : ""
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_access_token", url))
  }

  return NextResponse.redirect(new URL(`/login?token=${encodeURIComponent(token)}`, url))
}
