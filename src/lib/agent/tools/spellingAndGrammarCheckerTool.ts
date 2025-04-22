import { ToolUtility } from '@azure/ai-projects';

export const spellingAndGrammarCheckerToolMeta = {
  key: 'checkSpellingAndGrammar',
  userDescription: 'Checking for spelling and grammar mistakes',
  icon: '📝',
};

export const spellingAndGrammarCheckerTool = ToolUtility.createFunctionTool({
    name: spellingAndGrammarCheckerToolMeta.key,
    description: 'Identifies spelling, punctuation, and syntax issues in the submission and suggests corrections. This should result in a clear set of pairs, e.g. "shud" - "should"',
    parameters: {
      type: 'object',
      properties: {
        submission: { type: 'string', description: 'The student submission text' },
        rubric: { type: 'string', description: 'The rubric or task description (for contextual tone adjustments)' }
      },
      required: ['submission']
    }
  });