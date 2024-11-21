import { GranularToolHandler, GranularToolResult } from './granular-tool-handler';
import { DiffViewProvider } from '../../integrations/editor/DiffViewProvider';
import { ReadFileRangeToolUse, SearchAndReplaceToolUse, InsertCodeBlockToolUse } from '../assistant-message';
import { formatResponse } from '../prompts/responses';

export class ClineToolIntegration {
  private granularToolHandler: GranularToolHandler;

  constructor(cwd: string, diffViewProvider: DiffViewProvider) {
    this.granularToolHandler = new GranularToolHandler(cwd, diffViewProvider);
  }

  /**
   * Handles the read file range tool use
   */
  async handleReadFileRange(toolUse: ReadFileRangeToolUse): Promise<string> {
    const { path, start_line, end_line } = toolUse.params;
    
    if (!path) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('path'));
    }

    const startLine = start_line ? parseInt(start_line) : undefined;
    const endLine = end_line ? parseInt(end_line) : undefined;

    const result = await this.granularToolHandler.handleReadFileRange(
      path,
      startLine,
      endLine
    );

    if (!result.success) {
      return formatResponse.toolError(result.content);
    }

    return result.content;
  }

  /**
   * Handles the search and replace tool use
   */
  async handleSearchAndReplace(toolUse: SearchAndReplaceToolUse): Promise<string> {
    const { path, search_block, replace_block } = toolUse.params;
    
    if (!path) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('path'));
    }
    if (!search_block) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('search_block'));
    }
    if (!replace_block) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('replace_block'));
    }

    const result = await this.granularToolHandler.handleSearchReplace(
      path,
      search_block,
      replace_block
    );

    if (!result.success) {
      return formatResponse.toolError(result.content);
    }

    let response = result.content;
    if (result.diff) {
      response += `\n\nDiff of changes:\n${result.diff}`;
    }
    if (result.newProblemsMessage) {
      response += `\n\n${result.newProblemsMessage}`;
    }

    return response;
  }

  /**
   * Handles the insert code block tool use
   */
  async handleInsertCodeBlock(toolUse: InsertCodeBlockToolUse): Promise<string> {
    const { path, start_line, code_block } = toolUse.params;
    
    if (!path) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('path'));
    }
    if (!start_line) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('start_line'));
    }
    if (!code_block) {
      return formatResponse.toolError(formatResponse.missingToolParameterError('code_block'));
    }

    const startLine = parseInt(start_line);
    if (isNaN(startLine)) {
      return formatResponse.toolError('Invalid start_line parameter: must be a number');
    }

    const result = await this.granularToolHandler.handleInsertCode(
      path,
      startLine,
      code_block
    );

    if (!result.success) {
      return formatResponse.toolError(result.content);
    }

    let response = result.content;
    if (result.newProblemsMessage) {
      response += `\n\n${result.newProblemsMessage}`;
    }

    return response;
  }

  /**
   * Applies changes after user confirmation
   */
  async applyChanges(filePath: string): Promise<GranularToolResult> {
    return await this.granularToolHandler.applyChanges(filePath);
  }

  /**
   * Reverts changes if user rejects them
   */
  async revertChanges(): Promise<void> {
    await this.granularToolHandler.revertChanges();
  }
}
