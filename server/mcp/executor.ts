import { z } from 'zod'
import type { McpTool, McpToolExecutionResult } from './types'
import { mcpToolRegistry } from './registry'
import prisma from '../utils/prisma'

export async function executeTool(
  toolName: string,
  params: Record<string, any>,
  sessionId?: string
): Promise<McpToolExecutionResult> {
  const startTime = Date.now()

  try {
    const tool = mcpToolRegistry.get(toolName)
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`)
    }

    const validatedParams = validateParameters(tool, params)
    const result = await tool.handler(validatedParams)

    const duration = Date.now() - startTime

    await logToolExecution(toolName, params, result, 'success', undefined, duration, sessionId)

    return {
      success: true,
      data: result,
      duration
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await logToolExecution(toolName, params, null, 'error', errorMessage, duration, sessionId)

    return {
      success: false,
      error: errorMessage,
      duration
    }
  }
}

function validateParameters(tool: McpTool, params: Record<string, any>): Record<string, any> {
  const schema = buildZodSchema(tool.parameters)
  return schema.parse(params)
}

function buildZodSchema(parameters: McpTool['parameters']): z.ZodObject<any> {
  const shape: Record<string, z.ZodType<any>> = {}

  for (const param of parameters) {
    let schema: z.ZodType<any>

    switch (param.type) {
      case 'string':
        schema = z.string()
        break
      case 'number':
        schema = z.number()
        break
      case 'boolean':
        schema = z.boolean()
        break
      case 'object':
        schema = z.object({})
        break
      case 'array':
        schema = z.array(z.any())
        break
      default:
        schema = z.any()
    }

    if (param.description) {
      schema = schema.describe(param.description)
    }

    if (!param.required) {
      schema = schema.optional()
    }

    shape[param.name] = schema
  }

  return z.object(shape)
}

async function logToolExecution(
  toolName: string,
  input: Record<string, any>,
  output: any,
  status: string,
  error?: string,
  duration?: number,
  sessionId?: string
) {
  try {
    const tool = mcpToolRegistry.get(toolName)
    if (!tool) return

    await prisma.mcpToolExecution.create({
      data: {
        toolId: toolName,
        sessionId,
        input,
        output,
        status,
        error,
        duration
      }
    })
  } catch (logError) {
    console.error('Failed to log tool execution:', logError)
  }
}