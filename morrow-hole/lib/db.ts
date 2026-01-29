import "server-only"
import { createPool, type Pool } from "mysql2/promise"

const rawUrl = process.env.MYSQL_URL ?? process.env.DATABASE_URL ?? ""
const url = rawUrl ? new URL(rawUrl) : null

const mysqlConfig = {
    host: process.env.MYSQL_HOST ?? url?.hostname,
    port: Number(process.env.MYSQL_PORT ?? (url?.port || 3306)),
    user: process.env.MYSQL_USER ?? (url?.username ? decodeURIComponent(url.username) : undefined),
    password: process.env.MYSQL_PASSWORD ?? (url?.password ? decodeURIComponent(url.password) : undefined),
    database: process.env.MYSQL_DATABASE ?? (url?.pathname ? decodeURIComponent(url.pathname.replace(/^\//, "")) : undefined),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

if (!mysqlConfig.host || !mysqlConfig.user || !mysqlConfig.database) {
    throw new Error("Missing MySQL environment variables: set MYSQL_HOST/MYSQL_USER/MYSQL_DATABASE or MYSQL_URL")
}

declare global {
    var mysqlPool: Pool | undefined
}

const pool = global.mysqlPool ?? createPool(mysqlConfig)

if (process.env.NODE_ENV !== "production") {
    global.mysqlPool = pool
}

export default pool
