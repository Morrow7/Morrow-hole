import "server-only"
import { createPool, type Pool } from "mysql2/promise"

const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

if (!mysqlConfig.host || !mysqlConfig.user || !mysqlConfig.database) {
    throw new Error("Missing MySQL environment variables")
}

declare global {
    var mysqlPool: Pool | undefined
}

const pool = global.mysqlPool ?? createPool(mysqlConfig)

if (process.env.NODE_ENV !== "production") {
    global.mysqlPool = pool
}

export default pool
