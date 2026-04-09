# AI 智能助手 - 使用指南

基于 Nuxt.js + Ollama + MCP 的本地化AI聊天系统

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Nuxt 应用                            │
├─────────────────────────────────────────────────────────────┤
│  前端: Vue 3 + Tailwind CSS + 聊天界面                      │
├─────────────────────────────────────────────────────────────┤
│  后端 API: server/api/chat.post.ts (Ollama集成)             │
├─────────────────────────────────────────────────────────────┤
│  MCP 工具箱 (server/mcp/)                                   │
│  ├── tools/     → 数据库查询工具                            │
│  ├── registry/  → 工具注册中心                              │
│  └── executor/  → 工具执行器                                │
├─────────────────────────────────────────────────────────────┤
│  数据层                                                     │
│  ├── MySQL (Prisma ORM)                                     │
│  ├── 向量存储 (MySQL)                                       │
│  └── 聊天历史 (MySQL)                                       │
└─────────────────────────────────────────────────────────────┘
```

## 安装和配置

### 1. 安装 Ollama

**Windows:**
```bash
# 下载并安装 Ollama
# https://ollama.ai/download

# 安装完成后，拉取模型
ollama pull llama2
```

**验证安装:**
```bash
ollama list
```

### 2. 配置环境变量

`.env` 文件已配置：
```env
# 数据库配置
DATABASE_URL="mysql://root:ccc040508@localhost:3306/nuxt_demo"

# Ollama配置
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 3. 启动服务

```bash
# 启动开发服务器
pnpm dev

# 访问聊天界面
http://localhost:3000/chat
```

## 功能特性

### 1. 智能对话
- 基于本地 Ollama 模型
- 支持上下文记忆
- 流式响应（即将支持）

### 2. MCP 工具集成

#### 数据库查询工具
```
用户问："帮我查一下订单表里最近10条记录"
     ↓
AI 分析意图 → 调用 MCP 工具 → 查询 MySQL
     ↓
AI 回复："找到了以下10条订单记录：[表格]"
```

#### 可用工具
- `database_query` - 查询数据库表
- `database_insert` - 插入数据到表

### 3. 聊天历史
- 自动保存对话历史
- 支持多会话管理
- 工具执行记录追踪

## 使用示例

### 示例 1: 查询数据库
```
用户: 帮我查一下用户表里最近10条记录
AI: 我帮你查询了用户表，找到了以下10条记录：
[显示表格数据]
```

### 示例 2: 项目介绍
```
用户: 介绍一下这个项目的功能
AI: 这是一个基于Nuxt.js和Ollama的AI聊天系统...
```

### 示例 3: 了解能力
```
用户: 你有什么能力？
AI: 我可以帮你：
1. 查询数据库
2. 回答问题
3. 执行各种任务
```

## 数据库表结构

### 用户表 (users)
- id, name, email, created_at

### 聊天会话表 (chat_sessions)
- id, user_id, title, created_at, updated_at

### 聊天消息表 (chat_messages)
- id, session_id, role, content, metadata, created_at

### 文档表 (documents)
- id, title, content, source, document_type, metadata

### 文档向量表 (document_embeddings)
- id, document_id, chunk_index, chunk_text, embedding

### MCP工具表 (mcp_tools)
- id, name, description, parameters, handler, is_active

### MCP工具执行记录表 (mcp_tool_executions)
- id, tool_id, session_id, input, output, status, error, duration

## API 接口

### 聊天接口
```typescript
POST /api/chat
{
  "message": "帮我查一下用户表",
  "sessionId": "可选，会话ID",
  "history": "可选，历史消息"
}
```

### Ollama状态检查
```typescript
GET /api/ollama/status
```

## 扩展开发

### 添加新的MCP工具

1. 在 `server/mcp/tools/` 创建新工具文件
2. 在 `server/mcp/index.ts` 注册工具
3. 工具会自动被AI识别和调用

示例：
```typescript
export const myCustomTool: McpTool = {
  name: 'my_custom_tool',
  description: '工具描述',
  parameters: [
    {
      name: 'param1',
      type: 'string',
      description: '参数描述',
      required: true
    }
  ],
  handler: async (params) => {
    // 工具逻辑
    return { result: 'success' }
  }
}
```

## 性能优化

- ✅ 禁用 Google Fonts（避免国内访问慢）
- ✅ 使用本地 Ollama 模型（无需国外API）
- ✅ MySQL 本地数据库
- ✅ Prisma ORM 类型安全

## 故障排除

### Ollama 未连接
```bash
# 检查 Ollama 服务
ollama list

# 启动 Ollama 服务
ollama serve
```

### 数据库连接失败
```bash
# 检查 MySQL 服务
net start mysql

# 重新生成 Prisma 客户端
npx prisma generate
```

## 技术栈

- **前端**: Nuxt.js 4, Vue 3, TypeScript, Tailwind CSS
- **后端**: Nuxt Server API, Prisma ORM
- **AI**: Ollama (本地模型)
- **数据库**: MySQL
- **工具**: MCP (Model Context Protocol)

## 下一步计划

- [ ] 实现RAG功能（检索增强生成）
- [ ] 添加更多MCP工具
- [ ] 支持流式响应
- [ ] 添加文件上传功能
- [ ] 实现多模型切换

## 许可证

MIT