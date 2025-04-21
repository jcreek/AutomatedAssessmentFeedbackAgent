import { ToolUtility } from '@azure/ai-projects';

export const conceptVerifierToolMeta = {
  key: 'verifyConceptCoverage',
  userDescription: 'Checking for required concepts from the rubric',
  icon: '📋',
};

export const conceptVerifierTool = ToolUtility.createFunctionTool({
    name: conceptVerifierToolMeta.key,
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