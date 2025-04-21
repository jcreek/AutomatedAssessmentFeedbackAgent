import { ToolUtility } from '@azure/ai-projects';

export const feedbackGeneratorTool = ToolUtility.createFunctionTool({
    name: 'generateFeedback',
    description: 'Produces two praise points and two actionable “try next time” suggestions based on submission and rubric.',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string' },
        rubric: { type: 'string' }
      },
      required: ['submission', 'rubric']
    }
  });