import { workspace, Uri } from 'vscode';
import * as path from 'path';
import { createPatch } from 'diff';

export class FileOperations {
  /**
   * Reads a specific range of lines from a file
   */
  static async readRange(filePath: string, startLine?: number, endLine?: number): Promise<string> {
    const fileContent = await workspace.fs.readFile(Uri.file(filePath));
    const content = new TextDecoder().decode(fileContent);
    const lines = content.split('\n');

    if (!startLine && !endLine) {
      return content;
    }

    const start = startLine ? startLine - 1 : 0;
    const end = endLine ? endLine : lines.length;

    if (start < 0 || end > lines.length || start >= end) {
      throw new Error('Invalid line range specified');
    }

    return lines.slice(start, end).join('\n');
  }

  /**
   * Creates a diff between original and modified content
   */
  static createDiff(originalContent: string, modifiedContent: string, filePath: string): string {
    const patch = createPatch(
      path.basename(filePath),
      originalContent,
      modifiedContent,
      'Original',
      'Modified'
    );
    return patch;
  }

  /**
   * Inserts code at a specific line in a file
   */
  static async insertCodeAtLine(filePath: string, lineNumber: number, codeToInsert: string): Promise<string> {
    const fileContent = await workspace.fs.readFile(Uri.file(filePath));
    const content = new TextDecoder().decode(fileContent);
    const lines = content.split('\n');

    if (lineNumber < 1 || lineNumber > lines.length + 1) {
      throw new Error('Invalid line number specified');
    }

    lines.splice(lineNumber - 1, 0, codeToInsert);
    return lines.join('\n');
  }

  /**
   * Performs a search and replace operation on a file
   */
  static async searchAndReplace(filePath: string, searchBlock: string, replaceBlock: string): Promise<{
    originalContent: string;
    modifiedContent: string;
    diff: string;
  }> {
    const fileContent = await workspace.fs.readFile(Uri.file(filePath));
    const originalContent = new TextDecoder().decode(fileContent);
    
    if (!originalContent.includes(searchBlock)) {
      throw new Error('Search block not found in file');
    }

    const modifiedContent = originalContent.replace(searchBlock, replaceBlock);
    const diff = this.createDiff(originalContent, modifiedContent, filePath);

    return {
      originalContent,
      modifiedContent,
      diff
    };
  }

  /**
   * Validates if a file exists at the given path
   */
  static async validateFilePath(filePath: string): Promise<boolean> {
    try {
      await workspace.fs.stat(Uri.file(filePath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Writes content to a file
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    const contentBuffer = new TextEncoder().encode(content);
    await workspace.fs.writeFile(Uri.file(filePath), contentBuffer);
  }
}
