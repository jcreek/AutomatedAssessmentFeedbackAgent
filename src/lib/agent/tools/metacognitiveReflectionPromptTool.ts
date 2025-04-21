import { ToolUtility } from '@azure/ai-projects';

export const metacognitiveReflectionPromptToolMeta = {
  key: 'generateReflectionPrompts',
  userDescription: 'Suggesting ways the student can improve next time',
  icon: '💭',
};

export const metacognitiveReflectionPromptTool = ToolUtility.createFunctionTool({
    name: metacognitiveReflectionPromptToolMeta.key,
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