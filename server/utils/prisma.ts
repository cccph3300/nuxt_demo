import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 延迟加载 PrismaClient
let prismaInstance: any

const prismaClientSingleton = async () => {
  if (!prismaInstance) {
    try {
      // 尝试 ESM 动态导入
      const { PrismaClient } = await import('@prisma/client')
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
      prismaInstance = new PrismaClient({ adapter })
    } catch (error) {
      // 降级为 CommonJS 导入
      console.log('使用 CommonJS 导入 PrismaClient')
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url)
      const { PrismaClient } = require('@prisma/client')
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
      prismaInstance = new PrismaClient({ adapter })
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