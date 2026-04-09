import type { McpTool } from './types'

class McpToolRegistry {
  private tools: Map<string, McpTool> = new Map()

  register(tool: McpTool) {
    this.tools.set(tool.name, tool)
  }

  get(name: string): McpTool | undefined {
    return this.tools.get(name)
  }

  getAll(): McpTool[] {
    return Array.from(this.tools.values())
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }
}

export const mcpToolRegistry = new McpToolRegistry()