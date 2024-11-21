export const GRANULAR_TOOLS_DESCRIPTION = `
## read_file_range
Description: Request to read a specific range of lines from a file. This is more efficient than reading the entire file when you only need to examine a specific portion. Use this when you need to analyze or understand a particular section of code or content.
Parameters:
- path: (required) The path of the file to read from
- start_line: (optional) The starting line number to read from (inclusive). If not provided, starts from the first line.
- end_line: (optional) The ending line number to read to (inclusive). If not provided, reads to the end of file.
Usage:
<read_file_range>
<path>File path here</path>
<start_line>Starting line number (optional)</start_line>
<end_line>Ending line number (optional)</end_line>
</read_file_range>

## search_and_replace
Description: Request to perform a search and replace operation in a file. This tool provides a merge-conflict style UI for reviewing changes before they are applied. Use this when you need to modify specific portions of a file without rewriting the entire content.
Parameters:
- path: (required) The path of the file to modify
- search_block: (required) The text content to search for
- replace_block: (required) The text content to replace with
Usage:
<search_and_replace>
<path>File path here</path>
<search_block>Content to search for</search_block>
<replace_block>Content to replace with</replace_block>
</search_and_replace>

## insert_code_block
Description: Request to insert a block of code at a specific line number in a file. This is more efficient than rewriting the entire file when you only need to add new code at a specific location.
Parameters:
- path: (required) The path of the file to modify
- start_line: (required) The line number where the code block should be inserted
- code_block: (required) The code to insert
Usage:
<insert_code_block>
<path>File path here</path>
<start_line>Line number to insert at</start_line>
<code_block>Code to insert</code_block>
</insert_code_block>
`
