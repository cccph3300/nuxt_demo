import { Ollama } from 'ollama'

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
})

export default defineEventHandler(async () => {
  try {
    await ollama.list()
    return {
      status: 'ok',
      message: 'Ollama服务正常运行'
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Ollama服务未运行',
      hint: '请确保Ollama已安装并运行在 http://localhost:11434'
    }
  }
})