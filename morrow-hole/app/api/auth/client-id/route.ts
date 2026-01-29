import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || ""
  return NextResponse.json({ clientId })
}

