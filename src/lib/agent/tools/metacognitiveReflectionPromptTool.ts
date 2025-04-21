import { ToolUtility } from '@azure/ai-projects';

export const metacognitiveReflectionPromptTool = ToolUtility.createFunctionTool({
    name: 'generateReflectionPrompts',
    description: 'Based on rubric shortfalls, generates prompts like “How could you strengthen your evidence in paragraph 2?”',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string' },
        rubric: { type: 'string' }
      },
      required: ['submission', 'rubric']
    }
  });