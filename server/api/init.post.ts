import { query } from '../utils/database'

export default defineEventHandler(async () => {
  try {
    // 创建用户表
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 插入示例数据
    await query(`
      INSERT IGNORE INTO users (name, email) VALUES 
      ('张三', 'zhangsan@example.com'),
      ('李四', 'lisi@example.com'),
      ('王五', 'wangwu@example.com')
    `)

    return {
      success: true,
      message: '数据库初始化成功'
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      message: '数据库初始化失败'
    }
  }
})
