import { ToolUtility } from '@azure/ai-projects';

export const essayAnalyzerTool = ToolUtility.createFunctionTool({
  name: 'analyzeEssay',
  description: 'Analyzes an essay for structure, argument, and evidence.',
  parameters: {
    type: 'object',
    properties: {
      essay: { type: 'string', description: 'The essay text' }
    },
    required: ['essay']
  }
});
