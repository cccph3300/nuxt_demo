import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 延迟加载 PrismaClient
let prismaInstance: any

const prismaClientSingleton = async () => {
  if (!prismaInstance) {
    try {
      // 使用默认导入方式（Vercel 推荐）
      const PrismaModule = await import('@prisma/client')
      const PrismaClient = PrismaModule.PrismaClient || PrismaModule.default?.PrismaClient
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
      prismaInstance = new PrismaClient({ adapter })
    } catch (error) {
      console.error('PrismaClient 导入失败:', error)
      throw new Error('无法初始化 PrismaClient')
    }
  }
  return prismaInstance
}

// 立即初始化
let prisma: any
prismaClientSingleton().then((instance) => {
  prisma = instance
  
  // 赋值给全局变量
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = instance
  }
})

declare global {
  var prismaGlobal: any
}

// 导出 prisma 实例
export default prisma