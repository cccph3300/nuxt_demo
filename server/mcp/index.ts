import { mcpToolRegistry } from './registry'
import { databaseQueryTool, databaseInsertTool } from './tools/database'

export function initializeMcpTools() {
  mcpToolRegistry.register(databaseQueryTool)
  mcpToolRegistry.register(databaseInsertTool)
  
  console.log('MCP工具系统已初始化')
}

export { mcpToolRegistry } from './registry'
export { executeTool } from './executor'
export type { McpTool, McpToolExecutionResult } from './types'