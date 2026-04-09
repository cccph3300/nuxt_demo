import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 延迟加载 PrismaClient
let prismaInstance: any

const prismaClientSingleton = async () => {
  if (!prismaInstance) {
    try {
      // 使用动态导入，兼容 ESM 和 CommonJS
      const PrismaModule = await import('@prisma/client')
      
      // 尝试多种方式获取 PrismaClient
      let PrismaClient = PrismaModule.PrismaClient
      
      if (!PrismaClient && PrismaModule.default) {
        PrismaClient = PrismaModule.default.PrismaClient || PrismaModule.default
      }
      
      if (!PrismaClient) {
        throw new Error('无法从 @prisma/client 模块获取 PrismaClient')
      }
      
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
      prismaInstance = new PrismaClient({ adapter })
      
      console.log('PrismaClient 初始化成功')
    } catch (error) {
      console.error('PrismaClient 初始化失败:', error)
      // 创建一个模拟的 prisma 实例，避免应用崩溃
      prismaInstance = createMockPrisma()
    }
  }
  return prismaInstance
}

// 创建模拟 Prisma 实例（用于构建时或初始化失败时）
function createMockPrisma() {
  return {
    user: { findMany: async () => [], create: async () => ({}) },
    chatSession: { findMany: async () => [], create: async () => ({}) },
    chatMessage: { findMany: async () => [], create: async () => ({}) },
    document: { findMany: async () => [], create: async () => ({}) },
    documentEmbedding: { findMany: async () => [], create: async () => ({}) },
    mcpTool: { findMany: async () => [], create: async () => ({}) },
    mcpToolExecution: { findMany: async () => [], create: async () => ({}) },
    $connect: async () => {},
    $disconnect: async () => {}
  }
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