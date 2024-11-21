export type AssistantMessageContent = TextContent | ToolUse

export { parseAssistantMessage } from "./parse-assistant-message"

export interface TextContent {
  type: "text"
  content: string
  partial: boolean
}

export const toolUseNames = [
  "execute_command",
  "read_file",
  "write_to_file",
  "search_files",
  "list_files",
  "list_code_definition_names",
  "browser_action",
  "ask_followup_question",
  "attempt_completion",
  "read_file_range",
  "search_and_replace",
  "insert_code_block",
] as const

// Converts array of tool call names into a union type ("execute_command" | "read_file" | ...)
export type ToolUseName = (typeof toolUseNames)[number]

export const toolParamNames = [
  "command",
  "path",
  "content",
  "regex",
  "file_pattern",
  "recursive",
  "action",
  "url",
  "coordinate",
  "text",
  "question",
  "result",
  "start_line",
  "end_line",
  "search_block",
  "replace_block",
  "code_block",
] as const

export type ToolParamName = (typeof toolParamNames)[number]

export interface ToolUse {
  type: "tool_use"
  name: ToolUseName
  // params is a partial record, allowing only some or none of the possible parameters to be used
  params: Partial<Record<ToolParamName, string>>
  partial: boolean
}

export interface ExecuteCommandToolUse extends ToolUse {
  name: "execute_command"
  // Pick<Record<ToolParamName, string>, "command"> makes "command" required, but Partial<> makes it optional
  params: Partial<Pick<Record<ToolParamName, string>, "command">>
}

export interface ReadFileToolUse extends ToolUse {
  name: "read_file"
  params: Partial<Pick<Record<ToolParamName, string>, "path">>
}

export interface WriteToFileToolUse extends ToolUse {
  name: "write_to_file"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "content">>
}

export interface SearchFilesToolUse extends ToolUse {
  name: "search_files"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "regex" | "file_pattern">>
}

export interface ListFilesToolUse extends ToolUse {
  name: "list_files"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "recursive">>
}

export interface ListCodeDefinitionNamesToolUse extends ToolUse {
  name: "list_code_definition_names"
  params: Partial<Pick<Record<ToolParamName, string>, "path">>
}

export interface BrowserActionToolUse extends ToolUse {
  name: "browser_action"
  params: Partial<Pick<Record<ToolParamName, string>, "action" | "url" | "coordinate" | "text">>
}

export interface AskFollowupQuestionToolUse extends ToolUse {
  name: "ask_followup_question"
  params: Partial<Pick<Record<ToolParamName, string>, "question">>
}

export interface AttemptCompletionToolUse extends ToolUse {
  name: "attempt_completion"
  params: Partial<Pick<Record<ToolParamName, string>, "result" | "command">>
}

// New granular tool interfaces

export interface ReadFileRangeToolUse extends ToolUse {
  name: "read_file_range"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "start_line" | "end_line">>
}

export interface SearchAndReplaceToolUse extends ToolUse {
  name: "search_and_replace"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "search_block" | "replace_block">>
}

export interface InsertCodeBlockToolUse extends ToolUse {
  name: "insert_code_block"
  params: Partial<Pick<Record<ToolParamName, string>, "path" | "start_line" | "code_block">>
}
