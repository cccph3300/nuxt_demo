import { query } from '../utils/database'

export default defineEventHandler(async () => {
  try {
    const users = await query('SELECT * FROM users ORDER BY created_at DESC')
    return {
      success: true,
      data: users
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {
      success: false,
      message: '获取用户列表失败'
    }
  }
})
