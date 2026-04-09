import { initializeMcpTools, executeTool, mcpToolRegistry } from '../mcp'
import prisma from '../utils/prisma'

initializeMcpTools()

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

  // 模拟AI响应逻辑
  if (message.includes('用户') && message.includes('查询')) {
    toolResult = await executeTool('database_query', {
      table: 'users',
      limit: 10,
      orderBy: 'createdAt'
    }, currentSessionId)

    assistantMessage = `我帮你查询了用户表，找到了 ${toolResult.data?.count || 0} 条记录。以下是查询结果：\n\n${JSON.stringify(toolResult.data?.data || [], null, 2)}`
  } else if (message.includes('功能') || message.includes('介绍')) {
    assistantMessage = `这是一个基于 Nuxt.js 和 Ollama 的 AI 智能助手系统，主要功能包括：

1. **智能对话** - 基于本地 AI 模型的自然语言交互
2. **数据库查询** - 自动识别查询意图并执行数据库操作
3. **工具集成** - 支持 MCP (Model Context Protocol) 工具
4. **聊天历史** - 自动保存和管理对话记录
5. **完全本地化** - 无需国外API，数据安全可控

你可以问我：
- "帮我查一下用户表"
- "介绍一下这个项目"
- "你有什么能力"`
  } else if (message.includes('能力') || message.includes('能做什么')) {
    assistantMessage = `作为 AI 智能助手，我可以帮你：

**数据库操作**
- 查询数据库表中的记录
- 插入新数据到数据库
- 分析数据并给出建议

**智能对话**
- 回答关于项目的问题
- 解释技术概念
- 提供使用建议

**工具执行**
- 自动识别需要执行的任务
- 调用相应的工具完成操作
- 展示执行结果

请随时提出你的问题！`
  } else {
    assistantMessage = `你好！我是你的 AI 智能助手。\n\n我注意到你还没有安装 Ollama，所以目前运行在模拟模式下。\n\n要获得完整的 AI 功能，请：\n\n1. 访问 https://ollama.ai/download 下载并安装 Ollama\n2. 运行命令：ollama pull llama2\n3. 重启开发服务器\n\n在此之前，我可以帮你：\n- 查询数据库（已可用）\n- 回答关于项目的问题\n- 介绍系统功能\n\n你想了解什么？`
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
    toolResult,
    mock: true
  }
})