import type { McpTool } from '../types'
import { prisma } from '../../utils/prisma'

const tableToModel: Record<string, string> = {
  'users': 'user',
  'chat_sessions': 'chatSession',
  'chat_messages': 'chatMessage',
  'documents': 'document',
  'document_embeddings': 'documentEmbedding',
  'mcp_tools': 'mcpTool',
  'mcp_tool_executions': 'mcpToolExecution'
}

export const databaseQueryTool: McpTool = {
  name: 'database_query',
  description: '查询数据库表中的记录，支持多种查询条件',
  parameters: [
    {
      name: 'table',
      type: 'string',
      description: '要查询的表名',
      required: true
    },
    {
      name: 'limit',
      type: 'number',
      description: '返回的记录数量限制',
      required: false
    },
    {
      name: 'orderBy',
      type: 'string',
      description: '排序字段',
      required: false
    },
    {
      name: 'where',
      type: 'object',
      description: '查询条件',
      required: false
    }
  ],
  handler: async (params) => {
    const { table, limit = 10, orderBy, where } = params

    const validTables = Object.keys(tableToModel)
    
    if (!validTables.includes(table)) {
      throw new Error(`无效的表名: ${table}。可用的表: ${validTables.join(', ')}`)
    }

    try {
      // 等待 prisma 初始化
      let attempts = 0
      while (!prisma && attempts < 5) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }

      if (!prisma) {
        throw new Error('Prisma 客户端初始化超时')
      }

      const modelName = tableToModel[table]
      const model = (prisma as any)[modelName as keyof typeof prisma]
      
      if (!model) {
        throw new Error(`找不到模型: ${modelName} (表: ${table})`)
      }

      const queryOptions: any = {
        take: limit
      }

      if (orderBy) {
        queryOptions.orderBy = { [orderBy]: 'desc' }
      }

      if (where) {
        queryOptions.where = where
      }

      const result = await model.findMany(queryOptions)

      return {
        table,
        count: result.length,
        data: result
      }
    } catch (error) {
      console.error('数据库查询错误:', error)
      throw new Error(`查询失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export const databaseInsertTool: McpTool = {
  name: 'database_insert',
  description: '向数据库表中插入记录',
  parameters: [
    {
      name: 'table',
      type: 'string',
      description: '要插入的表名',
      required: true
    },
    {
      name: 'data',
      type: 'object',
      description: '要插入的数据',
      required: true
    }
  ],
  handler: async (params) => {
    const { table, data } = params

    const validTables = ['users', 'chat_sessions', 'chat_messages', 'documents', 'mcp_tools']
    
    if (!validTables.includes(table)) {
      throw new Error(`无效的表名: ${table}。可用的表: ${validTables.join(', ')}`)
    }

    try {
      if (!prisma) {
        throw new Error('Prisma 客户端未初始化')
      }

      const modelName = tableToModel[table]
       const model = (prisma as any)[modelName as keyof typeof prisma]
      
      if (!model) {
        throw new Error(`找不到模型: ${modelName} (表: ${table})`)
      }

      const result = await model.create({
        data
      })

      return {
        success: true,
        id: result.id,
        data: result
      }
    } catch (error) {
      console.error('数据库插入错误:', error)
      throw new Error(`插入失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}