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

if (!AI_FOUNDRY_PROJECT_CONNECTION_STRING) {
	throw new Error('AI_FOUNDRY_PROJECT_CONNECTION_STRING is not set');
}
if (!AI_MODEL) {
	throw new Error('AI_MODEL is not set');
}

export const client = AIProjectsClient.fromConnectionString(
	AI_FOUNDRY_PROJECT_CONNECTION_STRING,
	new DefaultAzureCredential()
);

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

const tools = allTools.map((t) => t.definition);

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

 If a user message begins with [HUMAN REVIEW]:, treat it as authoritative teacher feedback and use it as the basis for grading. Do not escalate to human review again.
`;

export const toolResources = allTools.reduce<Record<string, any>>((map, t) => {
	// Try all plausible locations for the tool name
	const name =
		t.definition.name || t.definition.function?.name || Object.keys(t.resources ?? {})[0];

	if (!name) {
		console.warn('Tool missing name:', t);
		return map;
	}
	map[name] = t;
	return map;
}, {});

export async function getOrCreateAgent() {
	const agentName = `assessment-feedback-agent`;
	// List all agents (may need pagination for large numbers)
	const agentsResponse = await client.agents.listAgents();
	const agents = Array.isArray(agentsResponse.data) ? agentsResponse.data : [];
	const existing = agents.find((a: any) => a.name === agentName);
	if (existing) {
		return existing;
	}
	// Otherwise, create new agent
	const agent = await client.agents.createAgent(AI_MODEL, {
		name: agentName,
		instructions,
		temperature: 0.5,
		tools,
		toolResources,
		requestOptions: {
			headers: { 'x-ms-enable-preview': 'true' }
		}
	});
	return agent;
}

export const agent = await getOrCreateAgent();

/**
 * Delete all agents in the workspace.
 * Use with caution! This will remove ALL agents.
 */
export async function deleteAllAgents() {
	try {
		let allAgents: any[] = [];
		let after: string | undefined = undefined;
		let hasMore = true;

		while (hasMore) {
			const response = await client.agents.listAgents(after ? { after } : {});
			const agents = Array.isArray(response.data) ? response.data : [];
			allAgents = allAgents.concat(agents);
			hasMore = response.hasMore;
			after = response.lastId;
		}

		for (const agent of allAgents) {
			await client.agents.deleteAgent(agent.id, {
				requestOptions: {
					headers: { 'x-ms-enable-preview': 'true' }
				}
			});
			console.info(`Agent ${agent.id} (${agent.name}) deleted.`);
		}
		console.info('All agents deleted successfully.');
	} catch (err) {
		console.warn('Failed to delete all agents:', err);
	}
}
