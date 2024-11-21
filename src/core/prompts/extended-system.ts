import { SYSTEM_PROMPT, addCustomInstructions } from './system';
import { GRANULAR_TOOLS_DESCRIPTION } from './granular-tools';

export const EXTENDED_SYSTEM_PROMPT = async (
  cwd: string,
  supportsComputerUse: boolean
): Promise<string> => {
  const basePrompt = await SYSTEM_PROMPT(cwd, supportsComputerUse);
  
  // Find the position after the last tool description but before the examples
  const toolExamplesIndex = basePrompt.indexOf('# Tool Use Examples');
  if (toolExamplesIndex === -1) {
    throw new Error('Could not find Tool Use Examples section in system prompt');
  }

  // Insert our granular tools description before the examples
  const extendedPrompt = 
    basePrompt.slice(0, toolExamplesIndex) +
    GRANULAR_TOOLS_DESCRIPTION +
    basePrompt.slice(toolExamplesIndex);

  return extendedPrompt;
};

export { addCustomInstructions };
