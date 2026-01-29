import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

type FriendLink = RowDataPacket & {
    id: number
    title: string
    desc: string
}

export async function GET() {
    let items: FriendLink[] = []

    try {
        const [rows] = await pool.query<FriendLink[]>(
            "SELECT id, title, `desc` AS `desc` FROM friend_links ORDER BY id ASC"
        )
        items = Array.isArray(rows) ? rows : []
    } catch {
        items = []
    }

    return NextResponse.json({ items })
}
