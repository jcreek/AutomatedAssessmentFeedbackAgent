import { DefaultAzureCredential } from '@azure/identity';
import { AIProjectsClient } from '@azure/ai-projects';
import { ToolUtility } from '@azure/ai-projects';
import { AI_FOUNDRY_PROJECT_CONNECTION_STRING, AI_MODEL } from '$env/static/private';

import { 
  rubricMatcherTool, 
  essayAnalyzerTool, 
  conceptVerifierTool, 
  feedbackGeneratorTool, 
  metacognitiveReflectionPromptTool, 
  selfAssessmentTool, 
  spellingAndGrammarCheckerTool 
} from '../tools/index';

const connectionString = AI_FOUNDRY_PROJECT_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('AI_FOUNDRY_PROJECT_CONNECTION_STRING is not set in environment variables');
}

const aiModel = AI_MODEL || '';
if (!connectionString) {
  throw new Error('AI_MODEL is not set in environment variables');
}

const client = AIProjectsClient.fromConnectionString(
  connectionString,
  new DefaultAzureCredential()
);

const codeInterpreterTool = ToolUtility.createCodeInterpreterTool([]);

const tools = [
  codeInterpreterTool.definition,
  rubricMatcherTool.definition,
  essayAnalyzerTool.definition,
  conceptVerifierTool.definition,
  feedbackGeneratorTool.definition,
  metacognitiveReflectionPromptTool.definition,
  selfAssessmentTool.definition,
  spellingAndGrammarCheckerTool.definition
];

const instructions = "You are a helpful agent that can assist with providing feedback on a student's work for a teacher. You are familiar with all modern pedagogy around summative and formative assessment, and K12 education, and primary and secondary education.";

const toolResources = {
  ...codeInterpreterTool.resources,
  matchRubric: {},
  analyzeEssay: {},
  conceptVerifier: {},
  feedbackGenerator: {},
  metacognitiveReflectionPrompt: {},
  selfAssessment: {},
  spellingAndGrammarChecker: {}
};

const agent = await client.agents.createAgent(aiModel, {
  name: `assessment-feedback-agent`,
  instructions,
  temperature: 0.5,
  tools,
  toolResources,

  requestOptions: {
    headers: { "x-ms-enable-preview": "true" },
  },
});

export { client, agent };