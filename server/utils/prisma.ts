import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 延迟加载 PrismaClient
let prismaInstance: any

const prismaClientSingleton = async () => {
  if (!prismaInstance) {
    // 动态导入 PrismaClient
    const { PrismaClient } = await import('@prisma/client')
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
    prismaInstance = new PrismaClient({ adapter })
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