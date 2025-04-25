import { client, agent, toolResources } from '../agent/services/agentService';
import { RunStreamEvent, ErrorEvent, type ThreadRunOutput } from '@azure/ai-projects';
import { PARTYKIT_BASE_URL } from '$env/static/private';
import type { OpenAIResponse } from '../utils/types';

export function buildGradingPrompt(submission: string, task: string): string {
	return `You are an expert secondary school teacher and AI assessment agent. Assess the following student submission in the context of the assignment/task provided.

TASK/ASSIGNMENT:
${task}

STUDENT SUBMISSION:
${submission}

Follow these steps:
1. Grade the work. Use whatever grading scheme is present in the rubric. If none is present then grade with a letter (A+ is best, E- is worst), using clear, objective criteria. DO NOT mention tool errors.
2. Identify specific strengths, referencing the success criteria.
3. Identify misconceptions or areas for improvement, using formative assessment language.
4. Design an individualized activity or exercise for the student to address their misconceptions or extend their learning. This activity should be:
   - Appropriately scaffolded for the student's current level.
   - Specific and actionable (e.g., a short written task, a practical exercise, or a quiz question).
   - Aligned with the curriculum and learning objectives.
5. Write a reflection question for the student to encourage metacognition.
6. Suggest to the teacher one way to support this student in the next lesson.
7. Show your reasoning step by step (chain-of-thought).

RESPONSE FORMAT (respond with a single JSON object, no extra text):

{
  "grade": "<number or string, e.g. 8/10, A, B+>",
  "strengths": "<text>",
  "areasForImprovement": "<text>",
  "individualizedActivity": "<text>",
  "reflectionQuestion": "<text>",
  "teacherSuggestion": "<text>",
  "spellingAndGrammar": "<text>",
  "reasoning": "<step-by-step explanation>"
}

Respond ONLY with the JSON object, with no preamble or explanation.`;
}

function fallbackGrade(submission: string, task: string): OpenAIResponse {
	console.warn('Using fallback grade logic');
	return {
		grade: 'EXAMPLE',
		strengths: `Clear argument and good evidence (task: ${task}).`,
		areasForImprovement: 'Needs deeper analysis.',
		individualizedActivity: 'Add two more supporting examples.',
		reflectionQuestion: 'Which part was hardest?',
		teacherSuggestion: 'Model a paragraph with evidence.',
		spellingAndGrammar: 'No errors detected.',
		reasoning: 'Standard fallback reasoning.'
	};
}

function extractTextFromMessage(msg: { content: any[] }): string {
	return msg.content
		.filter((c) => c.type === 'text')
		.map((c) => (typeof c.text === 'string' ? c.text : (c.text.value ?? '')))
		.join('\n')
		.trim();
}

// Recursively process each run stream, invoke the tools & notify PartyKit
async function processRunStream(
	threadId: string,
	stream: AsyncIterable<RunStreamEvent>,
	roomId: string
): Promise<ThreadRunOutput> {
	for await (const evt of stream) {
		// if (!evt.event.includes('delta')) {
		//   console.log('▶️ Stream event:', evt.event);
		// }

		if (evt.event === RunStreamEvent.ThreadRunRequiresAction) {
			const runOutput = evt.data as ThreadRunOutput;
			const calls = runOutput.requiredAction!.submitToolOutputs!.toolCalls!;

			// notify PartyKit
			await Promise.all(
				calls.map(async (call) => {
					if (!PARTYKIT_BASE_URL) return;
					const wsCtor =
						typeof WebSocket !== 'undefined' ? WebSocket : (await import('ws')).default;
					const ws = new wsCtor(`${PARTYKIT_BASE_URL}/party/tool-usage-server-${roomId}`);
					await new Promise<void>((res, rej) => {
						ws.onopen = () => res();
						ws.onerror = (e) => rej(e);
					});
					ws.send(JSON.stringify({ tool: call.function.name, time: new Date().toISOString() }));
					ws.close();
				})
			);

			// invoke the tools
			const toolOutputs = await Promise.all(
				calls.map(async (call) => {
					const name = call.function.name;
					const args = call.arguments!;
					try {
						const fn = toolResources[name];
						if (typeof fn !== 'function') {
							throw new Error(`No tool implementation for "${name}"`);
						}
						const result = await fn(args);
						return { toolCallId: call.id, output: result };
					} catch (err: any) {
						return { toolCallId: call.id, output: `Tool error: ${err.message}` };
					}
				})
			);

			// resume the run
			const resumed = client.agents.submitToolOutputsToRun(threadId, runOutput.id, toolOutputs);
			const nextStream = await resumed.stream();
			return processRunStream(threadId, nextStream, roomId);
		}

		if (evt.event === RunStreamEvent.ThreadRunCompleted) {
			return evt.data as ThreadRunOutput;
		}

		if (evt.event === ErrorEvent.Error) {
			throw new Error(`Agent error: ${JSON.stringify(evt.data)}`);
		}
	}

	throw new Error('Stream ended without completion');
}

export async function gradeSubmissionWithAgent(
	submission: string,
	task: string,
	roomId: string
): Promise<OpenAIResponse> {
	if (!client || !agent) {
		throw new Error('Agent not available');
	}

	const thread = await client.agents.createThread();
	await client.agents.createMessage(thread.id, {
		role: 'user',
		content: buildGradingPrompt(submission, task)
	});

	let initialStream: AsyncIterable<RunStreamEvent>;
	try {
		const runInvoker = client.agents.createRun(thread.id, agent.id, {
			parallelToolCalls: false
		});
		initialStream = await runInvoker.stream();
	} catch (err) {
		console.error('Failed to start run:', err);
		return fallbackGrade(submission, task);
	}

	// process all tool calls
	let finalRun: ThreadRunOutput;
	try {
		finalRun = await processRunStream(thread.id, initialStream, roomId);
	} catch (err) {
		console.error('Agent streaming failed:', err);
		return fallbackGrade(submission, task);
	}

	const msgs = await client.agents.listMessages(thread.id);
	const assistant = msgs.data.find((m) => m.role === 'assistant');
	const raw = assistant ? extractTextFromMessage(assistant) : '';

	// strip anything before the JSON object
	const match = raw.match(/\{[\s\S]*\}$/);
	const jsonText = match ? match[0] : raw;

	try {
		return JSON.parse(jsonText) as OpenAIResponse;
	} catch (parseErr) {
		console.error('JSON parse failed, returning fallback:', parseErr);
		return { ...fallbackGrade(submission, task), reasoning: raw };
	}
}
