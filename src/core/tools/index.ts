import { workspace, TextDocument, Range, Position } from 'vscode';
import { FileOperations } from './file-operations';
import { ToolHandler } from './tool-handler';
import * as path from 'path';

export interface SearchReplaceOperation {
  file: string;
  searchBlock: string;
  replaceBlock: string;
}

export interface InsertCodeOperation {
  file: string;
  startLine: number;
  codeBlock: string;
}

export interface FileRangeOperation {
  file: string;
  startLine?: number;
  endLine?: number;
}

export class FileOperationTools {
  /**
   * Performs a search and replace operation, returning the modified content
   * for review in a merge-conflict style UI
   */
  static async searchAndReplace(operation: SearchReplaceOperation): Promise<string> {
    return await ToolHandler.executeOperation({
      type: 'search-replace',
      params: operation
    });
  }

  /**
   * Inserts a code block at a specific line number in a file
   */
  static async insertCodeBlock(operation: InsertCodeOperation): Promise<string> {
    return await ToolHandler.executeOperation({
      type: 'insert-code',
      params: operation
    });
  }

  /**
   * Reads a specific range of lines from a file
   */
  static async readFileRange(operation: FileRangeOperation): Promise<string> {
    return await ToolHandler.executeOperation({
      type: 'read-range',
      params: operation
    });
  }

  /**
   * Validates if a file exists at the given path
   */
  static async validateFilePath(filePath: string): Promise<boolean> {
    return await ToolHandler.validateFilePath(filePath);
  }

  /**
   * Applies changes to a file after confirmation
   */
  static async applyChanges(filePath: string, newContent: string): Promise<void> {
    await ToolHandler.applyChanges(filePath, newContent);
  }
}

// Re-export the interfaces and classes for external use
export { FileOperations } from './file-operations';
export { ToolHandler } from './tool-handler';
