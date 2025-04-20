import { DefaultAzureCredential } from '@azure/identity';
import { AIProjectsClient } from '@azure/ai-projects';
import { rubricMatcherTool } from '../tools/rubricMatcherTool';
import { essayAnalyzerTool } from '../tools/essayAnalyzerTool';
import { ToolUtility } from '@azure/ai-projects';
import { AI_FOUNDRY_PROJECT_CONNECTION_STRING, AI_MODEL } from '$env/static/private';

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

const tools = [codeInterpreterTool.definition, rubricMatcherTool.definition, essayAnalyzerTool.definition];

const instructions = "You are a helpful agent that can assist with providing feedback on a student's work for a teacher.";

const toolResources = {
  ...codeInterpreterTool.resources,
  matchRubric: {},
  analyzeEssay: {}
};

const agent = await client.agents.createAgent(aiModel, {
  name: `agent-assessment-feedback`,
  instructions,
  temperature: 0.5,
  tools,
  toolResources,

  requestOptions: {
    headers: { "x-ms-enable-preview": "true" },
  },
});

export { client, agent };