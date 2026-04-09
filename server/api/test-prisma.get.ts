import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const userCount = await prisma.user.count()
    const sessionCount = await prisma.chatSession.count()
    const messageCount = await prisma.chatMessage.count()
    
    return {
      success: true,
      message: 'Prisma 连接正常',
      stats: {
        users: userCount,
        chatSessions: sessionCount,
        chatMessages: messageCount
      }
    }
  } catch (error) {
    console.error('Prisma 测试错误:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined
    }
  }
})