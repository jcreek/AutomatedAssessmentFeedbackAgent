import { ToolUtility } from '@azure/ai-projects';

export const essayAnalyzerToolMeta = {
  key: 'analyzeEssay',
  userDescription: 'Analyzing essay structure and argument quality',
  icon: '📝',
};

export const essayAnalyzerTool = ToolUtility.createFunctionTool({
  name: essayAnalyzerToolMeta.key,
  description: 'Analyzes an essay for structure, argument, and evidence.',
  parameters: {
    type: 'object',
    properties: {
      essay: { type: 'string', description: 'The essay text' }
    },
    required: ['essay']
  }
});
