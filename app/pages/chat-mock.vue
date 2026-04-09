<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶部导航 -->
    <div class="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-bot" class="w-8 h-8 text-primary-600" />
        <div>
          <h1 class="text-xl font-bold">AI 智能助手</h1>
          <p class="text-sm text-gray-500">模拟模式 - 无需安装 Ollama</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <UBadge color="warning">
          <UIcon name="i-lucide-flask-conical" class="w-4 h-4" />
          模拟模式
        </UBadge>
        <UButton
          variant="outline"
          @click="clearChat"
          icon="i-lucide-trash-2"
        >
          清空对话
        </UButton>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      <div class="max-w-4xl mx-auto space-y-4">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-message-circle" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-700 mb-2">欢迎使用 AI 助手（模拟模式）</h2>
          <p class="text-gray-500 mb-2">当前运行在模拟模式下，无需安装 Ollama 即可测试</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-yellow-800">
                <p class="font-medium mb-1">提示：要获得完整的 AI 功能</p>
                <ol class="list-decimal list-inside space-y-1">
                  <li>访问 <a href="https://ollama.ai/download" target="_blank" class="underline">https://ollama.ai/download</a> 下载并安装 Ollama</li>
                  <li>运行命令：<code class="bg-yellow-100 px-1 rounded">ollama pull llama2</code></li>
                  <li>重启开发服务器</li>
                </ol>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <UCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="sendSuggestion('帮我查一下用户表里最近10条记录')">
              <div class="text-center">
                <UIcon name="i-lucide-database" class="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p class="text-sm font-medium">查询数据库</p>
              </div>
            </UCard>
            <UCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="sendSuggestion('介绍一下这个项目的功能')">
              <div class="text-center">
                <UIcon name="i-lucide-info" class="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p class="text-sm font-medium">项目介绍</p>
              </div>
            </UCard>
            <UCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="sendSuggestion('你有什么能力？')">
              <div class="text-center">
                <UIcon name="i-lucide-zap" class="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p class="text-sm font-medium">了解能力</p>
              </div>
            </UCard>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- AI消息 -->
          <div v-if="msg.role === 'assistant'" class="flex gap-3 max-w-3xl">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <UIcon name="i-lucide-bot" class="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div class="flex-1">
              <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="prose prose-sm max-w-none whitespace-pre-wrap">{{ msg.content }}</div>
                
                <!-- 工具执行结果 -->
                <div v-if="msg.toolResult" class="mt-3 pt-3 border-t">
                  <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <UIcon name="i-lucide-wrench" class="w-4 h-4" />
                    <span>工具执行结果</span>
                  </div>
                  <pre class="bg-gray-50 rounded p-3 text-xs overflow-x-auto">{{ JSON.stringify(msg.toolResult, null, 2) }}</pre>
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-else class="flex gap-3 max-w-3xl flex-row-reverse">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-5 h-5 text-white" />
              </div>
            </div>
            <div class="flex-1">
              <div class="bg-primary-600 text-white rounded-lg p-4">
                <p>{{ msg.content }}</p>
              </div>
              <div class="text-xs text-gray-400 mt-1 text-right">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="loading" class="flex gap-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <UIcon name="i-lucide-bot" class="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-primary-600" />
              <span class="text-gray-600">AI 正在思考...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white border-t px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="sendMessage" class="flex gap-3">
          <UInput
            v-model="inputMessage"
            placeholder="输入你的问题..."
            size="xl"
            class="flex-1"
            :disabled="loading"
          />
          <UButton
            type="submit"
            size="xl"
            :loading="loading"
            :disabled="!inputMessage.trim()"
          >
            <UIcon name="i-lucide-send" class="w-5 h-5" />
            发送
          </UButton>
        </form>
        <div class="text-xs text-gray-400 mt-2 text-center">
          按 Enter 发送消息 | 当前为模拟模式，安装 Ollama 后体验完整功能
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolResult?: any
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const sessionId = ref<string | null>(null)

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  loading.value = true

  try {
    const response = await $fetch('/api/chat-mock', {
      method: 'POST',
      body: {
        message: userMessage,
        sessionId: sessionId.value,
        history: messages.value.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content
        }))
      }
    }) as any

    sessionId.value = response.sessionId

    messages.value.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      toolResult: response.toolResult
    })
  } catch (error: unknown) {
    console.error('发送消息失败:', error)
    
    const errorMessage = (error as { data?: { message?: string } }).data?.message || '发送消息失败'
    
    messages.value.push({
      role: 'assistant',
      content: `抱歉，发生了错误：${errorMessage}`,
      timestamp: new Date()
    })
  } finally {
    loading.value = false
  }
}

function sendSuggestion(text: string) {
  inputMessage.value = text
  sendMessage()
}

function clearChat() {
  messages.value = []
  sessionId.value = null
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>