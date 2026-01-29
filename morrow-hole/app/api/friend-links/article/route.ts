import { NextResponse } from "next/server"
import pool from "@/lib/db"

type Posts = {
    id: number
    title: string
    summary: string
    slug: string
}

export async function GET() {
    let items: Posts[] = []

    try {
        const [rows] = await pool.query<Posts[]>(
            "SELECT id, title, `desc` AS `desc` FROM friend_links ORDER BY id ASC"
        )
        items = Array.isArray(rows) ? rows : []
    } catch {
        items = []
    }

    return NextResponse.json({ items })
}
