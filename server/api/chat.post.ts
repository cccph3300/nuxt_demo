import { Ollama } from 'ollama'
import { initializeMcpTools, executeTool, mcpToolRegistry } from '../mcp'
import prisma from '../utils/prisma'

initializeMcpTools()

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
})

function detectToolIntent(message: string): { tool: string; params: any } | null {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('查') && (lowerMessage.includes('用户') || lowerMessage.includes('user'))) {
    const limitMatch = message.match(/(\d+)/)
    return {
      tool: 'database_query',
      params: {
        table: 'users',
        limit: limitMatch ? parseInt(limitMatch[1]) : 10,
        orderBy: 'createdAt'
      }
    }
  }
  
  if (lowerMessage.includes('查') && (lowerMessage.includes('订单') || lowerMessage.includes('order'))) {
    const limitMatch = message.match(/(\d+)/)
    return {
      tool: 'database_query',
      params: {
        table: 'orders',
        limit: limitMatch ? parseInt(limitMatch[1]) : 10,
        orderBy: 'createdAt'
      }
    }
  }
  
  if (lowerMessage.includes('添加') && lowerMessage.includes('用户')) {
    const nameMatch = message.match(/姓名[是为：:]\s*(\S+)/)
    const emailMatch = message.match(/邮箱[是为：:]\s*(\S+)/)
    
    if (nameMatch && emailMatch) {
      return {
        tool: 'database_insert',
        params: {
          table: 'users',
          data: {
            name: nameMatch[1],
            email: emailMatch[1]
          }
        }
      }
    }
  }
  
  return null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message, sessionId, history = [] } = body

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: '消息不能为空'
    })
  }

  let currentSessionId = sessionId

  if (!currentSessionId) {
    const session = await prisma.chatSession.create({
      data: {
        title: message.substring(0, 50),
        userId: 1
      }
    })
    currentSessionId = session.id
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: currentSessionId,
      role: 'user',
      content: message
    }
  })

  let assistantMessage = ''
  let toolResult = null

  const toolIntent = detectToolIntent(message)

  if (toolIntent) {
    try {
      toolResult = await executeTool(toolIntent.tool, toolIntent.params, currentSessionId)
      
      if (toolResult.success) {
        if (toolIntent.tool === 'database_query') {
          const count = toolResult.data?.count || 0
          const records = toolResult.data?.data || []
          
          assistantMessage = `我帮你查询了${toolIntent.params.table}表，找到了 ${count} 条记录。\n\n`
          
          if (records.length > 0) {
            assistantMessage += '查询结果：\n```json\n' + JSON.stringify(records, null, 2) + '\n```'
          } else {
            assistantMessage += '表中暂时没有数据。'
          }
        } else if (toolIntent.tool === 'database_insert') {
          assistantMessage = `成功添加了新记录！\n\n数据：\n\`\`\`json\n${JSON.stringify(toolResult.data, null, 2)}\n\`\`\``
        }
      } else {
        assistantMessage = `工具执行失败：${toolResult.error}`
      }
    } catch (error) {
      console.error('工具执行错误:', error)
      assistantMessage = `执行工具时发生错误：${error instanceof Error ? error.message : '未知错误'}`
    }
  } else {
    const systemPrompt = `你是一个友好、专业的中文 AI 助手，基于 Nuxt.js 和 Ollama 构建。

重要规则：
- 必须使用中文回答所有问题
- 回答要简洁、友好、专业
- 不要使用英文，除非是技术术语或代码

你的能力：
- 回答用户的问题
- 提供技术建议
- 解释概念
- 进行友好的对话

当用户需要查询数据库时，你会自动调用相应的工具。`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    try {
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || 'llama2',
        messages,
        stream: false
      })

      assistantMessage = response.message.content
      
      if (assistantMessage && !/[\u4e00-\u9fa5]/.test(assistantMessage)) {
        assistantMessage = `【提示】当前模型可能不支持中文，建议使用中文模型。\n\n原始回复：\n${assistantMessage}\n\n建议：\n1. 安装中文模型：ollama pull qwen2\n2. 修改 .env 文件：OLLAMA_MODEL=qwen2\n3. 重启开发服务器`
      }
    } catch (error) {
      console.error('Ollama 调用错误:', error)
      assistantMessage = `抱歉，AI 服务暂时不可用。错误信息：${error instanceof Error ? error.message : '未知错误'}\n\n你可以尝试：\n1. 检查 Ollama 是否正在运行\n2. 使用模拟模式：/chat-mock`
    }
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: currentSessionId,
      role: 'assistant',
      content: assistantMessage,
      metadata: toolResult ? { toolResult } : null
    }
  })

  return {
    success: true,
    sessionId: currentSessionId,
    message: assistantMessage,
    toolResult
  }
})