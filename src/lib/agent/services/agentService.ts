import { DefaultAzureCredential } from '@azure/identity';
import { AIProjectsClient, ToolUtility } from '@azure/ai-projects';
import {
  rubricMatcherTool,
  essayAnalyzerTool,
  conceptVerifierTool,
  feedbackGeneratorTool,
  metacognitiveReflectionPromptTool,
  selfAssessmentTool,
  spellingAndGrammarCheckerTool
} from '../tools/index';
import { AI_FOUNDRY_PROJECT_CONNECTION_STRING, AI_MODEL } from '$env/static/private';

const isTestEnv = process.env.NODE_ENV === 'test' || AI_FOUNDRY_PROJECT_CONNECTION_STRING === 'test';

const safeConnString = AI_FOUNDRY_PROJECT_CONNECTION_STRING || (isTestEnv ? 'dummy-connection-string' : undefined);
const safeModel = AI_MODEL || (isTestEnv ? 'dummy-model' : undefined);

if (!safeConnString && !isTestEnv) {
  throw new Error('AI_FOUNDRY_PROJECT_CONNECTION_STRING is not set');
}
if (!safeModel && !isTestEnv) {
  throw new Error('AI_MODEL is not set');
}

export const client = !isTestEnv && safeConnString
  ? AIProjectsClient.fromConnectionString(safeConnString, new DefaultAzureCredential())
  : undefined;

// const codeInterpreterTool = ToolUtility.createCodeInterpreterTool([]);

const allTools = [
  // codeInterpreterTool,
  rubricMatcherTool,
  essayAnalyzerTool,
  conceptVerifierTool,
  feedbackGeneratorTool,
  metacognitiveReflectionPromptTool,
  selfAssessmentTool,
  spellingAndGrammarCheckerTool
];

const tools = allTools.map(t => t.definition);

const instructions = `
You are a helpful agent that can assist with providing feedback on a student's work for a teacher.
You are familiar with modern pedagogy around summative and formative assessment in K-12 education.
Whenever you need to:
 • check the submission against the rubric → call "${rubricMatcherTool.definition.name}"  
 • verify which rubric concepts appear or are missing → call "${conceptVerifierTool.definition.name}"  
 • analyze essay structure → call "${essayAnalyzerTool.definition.name}"  
 • generate targeted feedback → call "${feedbackGeneratorTool.definition.name}"  
 • craft a metacognitive prompt → call "${metacognitiveReflectionPromptTool.definition.name}"  
 • guide self-assessment → call "${selfAssessmentTool.definition.name}"  
 • check spelling & grammar → call "${spellingAndGrammarCheckerTool.definition.name}"  
`;

export const toolResources = allTools.reduce<Record<string, any>>((map, t) => {
  // Try all plausible locations for the tool name
  const name =
    t.definition.name ||
    t.definition.function?.name ||
    Object.keys(t.resources ?? {})[0];

  if (!name) {
    console.warn('Tool missing name:', t);
    return map;
  }
  map[name] = t;
  return map;
}, {});

export const agent = client
  ? await client.agents.createAgent(AI_MODEL, {
      name: `assessment-feedback-agent`,
      instructions,
      temperature: 0.5,
      tools,
      toolResources,
      requestOptions: {
        headers: { 'x-ms-enable-preview': 'true' }
      }
    })
  : undefined;