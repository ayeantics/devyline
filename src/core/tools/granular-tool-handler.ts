import { FileOperations } from './file-operations';
import { ToolHandler } from './tool-handler';
import { DiffViewProvider } from '../../integrations/editor/DiffViewProvider';
import { showOmissionWarning } from '../../integrations/editor/detect-omission';
import * as vscode from 'vscode';
import * as path from 'path';

export interface GranularToolResult {
  success: boolean;
  content: string;
  userFeedback?: {
    text?: string;
    images?: string[];
  };
  diff?: string;
  newProblemsMessage?: string;
}

export class GranularToolHandler {
  constructor(
    private readonly cwd: string,
    private readonly diffViewProvider: DiffViewProvider
  ) {}

  /**
   * Handles reading a specific range of lines from a file
   */
  async handleReadFileRange(
    filePath: string,
    startLine?: number,
    endLine?: number
  ): Promise<GranularToolResult> {
    try {
      const absolutePath = path.resolve(this.cwd, filePath);
      const exists = await FileOperations.validateFilePath(absolutePath);
      
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = await FileOperations.readRange(absolutePath, startLine, endLine);
      return {
        success: true,
        content: `Successfully read lines ${startLine || 1} to ${endLine || 'end'} from ${filePath}:\n\n${content}`
      };
    } catch (error) {
      return {
        success: false,
        content: `Failed to read file range: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Handles search and replace operations with diff view integration
   */
  async handleSearchReplace(
    filePath: string,
    searchBlock: string,
    replaceBlock: string
  ): Promise<GranularToolResult> {
    try {
      const absolutePath = path.resolve(this.cwd, filePath);
      const exists = await FileOperations.validateFilePath(absolutePath);
      
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (!this.diffViewProvider.isEditing) {
        await this.diffViewProvider.open(filePath);
      }

      const result = await FileOperations.searchAndReplace(absolutePath, searchBlock, replaceBlock);
      await this.diffViewProvider.update(result.modifiedContent, true);
      await new Promise(resolve => setTimeout(resolve, 300));
      this.diffViewProvider.scrollToFirstDiff();

      return {
        success: true,
        content: 'Search and replace operation completed. Review the changes in the diff view.',
        diff: result.diff
      };
    } catch (error) {
      await this.diffViewProvider.reset();
      return {
        success: false,
        content: `Failed to perform search and replace: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Handles inserting code at a specific line
   */
  async handleInsertCode(
    filePath: string,
    startLine: number,
    codeBlock: string
  ): Promise<GranularToolResult> {
    try {
      const absolutePath = path.resolve(this.cwd, filePath);
      const exists = await FileOperations.validateFilePath(absolutePath);
      
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (!this.diffViewProvider.isEditing) {
        await this.diffViewProvider.open(filePath);
      }

      const result = await FileOperations.insertCodeAtLine(absolutePath, startLine, codeBlock);
      await this.diffViewProvider.update(result, true);
      await new Promise(resolve => setTimeout(resolve, 300));
      this.diffViewProvider.scrollToFirstDiff();

      return {
        success: true,
        content: `Successfully inserted code at line ${startLine} in ${filePath}. Review the changes in the diff view.`
      };
    } catch (error) {
      await this.diffViewProvider.reset();
      return {
        success: false,
        content: `Failed to insert code: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Applies changes after user confirmation
   */
  async applyChanges(filePath: string): Promise<GranularToolResult> {
    try {
      const { newProblemsMessage, userEdits, finalContent } = await this.diffViewProvider.saveChanges();
      await this.diffViewProvider.reset();

      return {
        success: true,
        content: 'Changes applied successfully',
        newProblemsMessage,
        diff: userEdits
      };
    } catch (error) {
      await this.diffViewProvider.revertChanges();
      return {
        success: false,
        content: `Failed to apply changes: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Reverts changes if user rejects them
   */
  async revertChanges(): Promise<void> {
    await this.diffViewProvider.revertChanges();
  }
}
