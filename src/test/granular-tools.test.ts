import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FileOperations } from '../core/tools/file-operations';
import { GranularToolHandler } from '../core/tools/granular-tool-handler';
import { DiffViewProvider } from '../integrations/editor/DiffViewProvider';

suite('Granular Tools Test Suite', () => {
    const testDir = path.join(__dirname, '../../test-fixtures');
    const testFilePath = path.join(testDir, 'test.txt');
    let diffViewProvider: DiffViewProvider;
    let granularToolHandler: GranularToolHandler;

    suiteSetup(async () => {
        // Create test directory and file
        await fs.mkdir(testDir, { recursive: true });
        await fs.writeFile(testFilePath, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
        
        diffViewProvider = new DiffViewProvider(testDir);
        granularToolHandler = new GranularToolHandler(testDir, diffViewProvider);
    });

    suiteTeardown(async () => {
        // Clean up test files
        await fs.rm(testDir, { recursive: true, force: true });
    });

    test('Read File Range - Full File', async () => {
        const result = await granularToolHandler.handleReadFileRange(testFilePath);
        assert.strictEqual(result.success, true);
        assert.ok(result.content.includes('Line 1'));
        assert.ok(result.content.includes('Line 5'));
    });

    test('Read File Range - Specific Lines', async () => {
        const result = await granularToolHandler.handleReadFileRange(testFilePath, 2, 4);
        assert.strictEqual(result.success, true);
        assert.ok(result.content.includes('Line 2'));
        assert.ok(result.content.includes('Line 4'));
        assert.ok(!result.content.includes('Line 1'));
        assert.ok(!result.content.includes('Line 5'));
    });

    test('Search and Replace', async () => {
        const result = await granularToolHandler.handleSearchReplace(
            testFilePath,
            'Line 2',
            'Modified Line 2'
        );
        assert.strictEqual(result.success, true);
        assert.ok(result.content.includes('Modified Line 2'));
    });

    test('Insert Code Block', async () => {
        const result = await granularToolHandler.handleInsertCode(
            testFilePath,
            3,
            'Inserted Line'
        );
        assert.strictEqual(result.success, true);
        assert.ok(result.content.includes('Inserted Line'));
    });

    test('Invalid File Path', async () => {
        const result = await granularToolHandler.handleReadFileRange(
            path.join(testDir, 'nonexistent.txt')
        );
        assert.strictEqual(result.success, false);
        assert.ok(result.content.includes('File not found'));
    });

    test('Invalid Line Range', async () => {
        const result = await granularToolHandler.handleReadFileRange(
            testFilePath,
            10,
            20
        );
        assert.strictEqual(result.success, false);
        assert.ok(result.content.includes('Invalid line range'));
    });

    test('Search Block Not Found', async () => {
        const result = await granularToolHandler.handleSearchReplace(
            testFilePath,
            'Nonexistent Line',
            'Replacement'
        );
        assert.strictEqual(result.success, false);
        assert.ok(result.content.includes('Search block not found'));
    });

    test('Invalid Insert Line', async () => {
        const result = await granularToolHandler.handleInsertCode(
            testFilePath,
            100,
            'Invalid Insert'
        );
        assert.strictEqual(result.success, false);
        assert.ok(result.content.includes('Invalid line number'));
    });

    test('File Operations - Basic File Operations', async () => {
        const testContent = 'Test content\nMultiple lines\nMore lines';
        const testFile = path.join(testDir, 'operations-test.txt');
        
        // Write test file
        await FileOperations.writeFile(testFile, testContent);
        
        // Validate file exists
        const exists = await FileOperations.validateFilePath(testFile);
        assert.strictEqual(exists, true);
        
        // Read specific range
        const rangeContent = await FileOperations.readRange(testFile, 1, 2);
        assert.strictEqual(rangeContent, 'Test content\nMultiple lines');
        
        // Search and replace
        const { modifiedContent } = await FileOperations.searchAndReplace(
            testFile,
            'Multiple',
            'Changed'
        );
        assert.ok(modifiedContent.includes('Changed lines'));
    });
});
