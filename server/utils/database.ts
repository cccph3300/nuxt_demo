import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ccc040508',
  database: process.env.DB_NAME || 'nuxt_demo'
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    console.log('数据库连接成功')
    return connection
  } catch (error) {
    console.error('数据库连接失败:', error)
    throw error
  }
}

export async function query(sql: string, params?: unknown[]) {
  const connection = await getConnection()
  try {
    const [results] = await connection.execute(sql, params as any)
    return results
  } finally {
    await connection.end()
  }
}
