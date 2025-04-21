import { ToolUtility } from '@azure/ai-projects';

export const feedbackGeneratorToolMeta = {
  key: 'generateFeedback',
  userDescription: 'Generating personalized feedback for the student',
  icon: '🌟',
};

export const feedbackGeneratorTool = ToolUtility.createFunctionTool({
    name: feedbackGeneratorToolMeta.key,
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