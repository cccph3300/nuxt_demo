import { query } from '../utils/database'

interface UserData {
  name: string
  email: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<UserData>(event)

    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: '姓名和邮箱不能为空'
      })
    }

    const result = await query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [body.name, body.email]
    )

    return {
      success: true,
      message: '用户添加成功',
      data: { id: (result as { insertId: number }).insertId }
    }
  } catch (error: unknown) {
    console.error('添加用户失败:', error)

    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱已存在'
      })
    }

    return {
      success: false,
      message: '添加用户失败'
    }
  }
})
