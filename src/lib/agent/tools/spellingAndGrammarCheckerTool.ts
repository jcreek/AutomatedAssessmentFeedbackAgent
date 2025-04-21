import { ToolUtility } from '@azure/ai-projects';

export const spellingAndGrammarCheckerTool = ToolUtility.createFunctionTool({
    name: 'checkSpellingAndGrammar',
    description: 'Identifies spelling, punctuation, and syntax issues in the submission and suggests corrections.',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string', description: 'The student submission text' },
        rubric: { type: 'string', description: 'The rubric or task description (for contextual tone adjustments)' }
      },
      required: ['submission']
    }
  });