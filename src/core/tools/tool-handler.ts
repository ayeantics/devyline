import { FileOperationTools, SearchReplaceOperation, InsertCodeOperation, FileRangeOperation } from './index';
import { FileOperations } from './file-operations';
import { workspace, window, Uri } from 'vscode';
import * as path from 'path';

export class ToolHandler {
  private static readonly cwd = workspace.workspaceFolders?.[0].uri.fsPath ?? '';

  /**
   * Handles the execution of file operations based on the tool type
   */
  static async executeOperation(operation: {
    type: 'search-replace' | 'insert-code' | 'read-range';
    params: SearchReplaceOperation | InsertCodeOperation | FileRangeOperation;
  }): Promise<string> {
    try {
      const absolutePath = path.resolve(this.cwd, operation.params.file);
      const exists = await FileOperations.validateFilePath(absolutePath);
      
      if (!exists) {
        throw new Error(`File not found: ${operation.params.file}`);
      }

      switch (operation.type) {
        case 'search-replace': {
          const params = operation.params as SearchReplaceOperation;
          const result = await FileOperations.searchAndReplace(
            absolutePath,
            params.searchBlock,
            params.replaceBlock
          );
          
          // Return the diff in a merge-conflict style format
          return `<<<<<<< Original
${result.originalContent}
=======
${result.modifiedContent}
>>>>>>> Modified

Diff:
${result.diff}`;
        }
        
        case 'insert-code': {
          const params = operation.params as InsertCodeOperation;
          const result = await FileOperations.insertCodeAtLine(
            absolutePath,
            params.startLine,
            params.codeBlock
          );
          return result;
        }
        
        case 'read-range': {
          const params = operation.params as FileRangeOperation;
          const result = await FileOperations.readRange(
            absolutePath,
            params.startLine,
            params.endLine
          );
          return result;
        }
        
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.showErrorMessage(`Failed to execute operation: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Applies changes to a file after confirmation
   */
  static async applyChanges(filePath: string, newContent: string): Promise<void> {
    try {
      const absolutePath = path.resolve(this.cwd, filePath);
      await FileOperations.writeFile(absolutePath, newContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.showErrorMessage(`Failed to apply changes: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Validates file path and ensures it exists
   */
  static async validateFilePath(filePath: string): Promise<boolean> {
    try {
      const absolutePath = path.resolve(this.cwd, filePath);
      return await FileOperations.validateFilePath(absolutePath);
    } catch {
      return false;
    }
  }
}
