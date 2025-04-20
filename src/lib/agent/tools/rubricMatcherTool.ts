import { ToolUtility } from '@azure/ai-projects';

export const rubricMatcherTool = ToolUtility.createFunctionTool({
  name: 'matchRubric',
  description: 'Matches a submission to a rubric and returns a score/criteria breakdown.',
  parameters: {
    type: 'object',
    properties: {
      submission: { type: 'string', description: 'The student submission text' },
      rubric: { type: 'string', description: 'The rubric criteria' }
    },
    required: ['submission', 'rubric']
  }
});
