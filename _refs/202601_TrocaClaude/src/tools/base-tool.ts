/**
 * Base Tool - Foundation for agent tools
 */

import { Logger } from '../utils/logger';

export interface ToolConfig {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export abstract class BaseTool {
  protected config: ToolConfig;
  protected logger: Logger;

  constructor(config: ToolConfig) {
    this.config = config;
    this.logger = new Logger(`Tool:${config.name}`);
  }

  abstract execute(params: Record<string, unknown>): Promise<ToolResult>;

  getName(): string {
    return this.config.name;
  }

  getDescription(): string {
    return this.config.description;
  }

  getParameters(): ToolParameter[] {
    return this.config.parameters;
  }

  validate(params: Record<string, unknown>): boolean {
    for (const param of this.config.parameters) {
      if (param.required && !(param.name in params)) {
        this.logger.error(`Missing required parameter: ${param.name}`);
        return false;
      }
    }
    return true;
  }

  toSchema(): Record<string, unknown> {
    return {
      name: this.config.name,
      description: this.config.description,
      input_schema: {
        type: 'object',
        properties: Object.fromEntries(
          this.config.parameters.map((p) => [
            p.name,
            {
              type: p.type,
              description: p.description,
            },
          ])
        ),
        required: this.config.parameters
          .filter((p) => p.required)
          .map((p) => p.name),
      },
    };
  }
}
