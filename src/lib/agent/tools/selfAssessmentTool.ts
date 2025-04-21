import { ToolUtility } from '@azure/ai-projects';

export const selfAssessmentTool = ToolUtility.createFunctionTool({
    name: 'createSelfAssessment',
    description: 'Generates 3 short questions that prompt the student to reflect on their own work based on rubric gaps.',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string' },
        rubric: { type: 'string' }
      },
      required: ['submission', 'rubric']
    }
  });