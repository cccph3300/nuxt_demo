import { z } from 'zod'

export interface McpToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  schema?: z.ZodType<any>
}

export interface McpTool {
  name: string
  description: string
  parameters: McpToolParameter[]
  handler: (params: Record<string, any>) => Promise<any>
}

export interface McpToolExecutionResult {
  success: boolean
  data?: any
  error?: string
  duration: number
}