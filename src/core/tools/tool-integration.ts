import { FileOperationTools, SearchReplaceOperation, InsertCodeOperation, FileRangeOperation } from './index';
import { DiffViewProvider } from '../../integrations/editor/DiffViewProvider';
import { showOmissionWarning } from '../../integrations/editor/detect-omission';
import * as vscode from 'vscode';
import * as path from 'path';

export interface ToolResult {
  success: boolean;
  content: string;
  userFeedback?: {
    text?: string;
    images?: string[];
  };
}

export class ToolIntegration {
  constructor(
    private readonly cwd: string,
    private readonly diffViewProvider: DiffViewProvider
  ) {}

  /**
   * Handles the read file range operation with the existing Cline infrastructure
   */
  async handleReadFileRange(operation: FileRangeOperation): Promise<ToolResult> {
    try {
      const content = await FileOperationTools.readFileRange(operation);
      return {
        success: true,
        content: `Successfully read file range from ${operation.file}:\n\n${content}`
      };
    } catch (error) {
      return {
        success: false,
        content: `Failed to read file range: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Handles the search and replace operation with the existing Cline infrastructure
   */
  async handleSearchReplace(operation: SearchReplaceOperation): Promise<ToolResult> {
    try {
      if (!this.diffViewProvider.isEditing) {
        await this.diffViewProvider.open(operation.file);
      }

      const result = await FileOperationTools.searchAndReplace(operation);
      await this.diffViewProvider.update(result, true);
      await new Promise(resolve => setTimeout(resolve, 300)); // wait for diff view to update
      this.diffViewProvider.scrollToFirstDiff();

      return {
        success: true,
        content: result
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
   * Handles the insert code operation with the existing Cline infrastructure
   */
  async handleInsertCode(operation: InsertCodeOperation): Promise<ToolResult> {
    try {
      if (!this.diffViewProvider.isEditing) {
        await this.diffViewProvider.open(operation.file);
      }

      const result = await FileOperationTools.insertCodeBlock(operation);
      await this.diffViewProvider.update(result, true);
      await new Promise(resolve => setTimeout(resolve, 300)); // wait for diff view to update
      this.diffViewProvider.scrollToFirstDiff();

      return {
        success: true,
        content: `Successfully inserted code at line ${operation.startLine} in ${operation.file}`
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
  async applyChanges(filePath: string): Promise<{
    success: boolean;
    content: string;
    newProblemsMessage?: string;
    userEdits?: string;
    finalContent?: string;
  }> {
    try {
      const { newProblemsMessage, userEdits, finalContent } = await this.diffViewProvider.saveChanges();
      await this.diffViewProvider.reset();

      return {
        success: true,
        content: 'Changes applied successfully',
        newProblemsMessage,
        userEdits,
        finalContent
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
