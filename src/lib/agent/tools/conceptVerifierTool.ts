import { ToolUtility } from '@azure/ai-projects';

export const conceptVerifierTool = ToolUtility.createFunctionTool({
    name: 'verifyConceptCoverage',
    description: 'Checks which rubric‑listed concepts appear (or are missing) in the submission.',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string' },
        rubric: { type: 'string' }
      },
      required: ['submission', 'rubric']
    }
  });