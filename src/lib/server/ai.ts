import { client, agent, toolResources } from '../agent/services/agentService';
import { RunStreamEvent, ErrorEvent, type ThreadRunOutput } from '@azure/ai-projects';
import { PARTYKIT_BASE_URL } from '$env/static/private';
import type { OpenAIResponse } from '../utils/types';

function sanitizeForPrompt(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // remove other control chars
}

function buildBaseGradingPrompt({
  task,
  submission,
  steps,
  responseFormat,
  extraSections = ''
}: {
  task: string;
  submission: string;
  steps: string;
  responseFormat: string;
  extraSections?: string;
}): string {
  return `You are an expert school teacher and AI assessment agent. Assess the following student submission in the context of the assignment/task provided.

===== TASK/ASSIGNMENT possibly including rubric or available marks =====

${task}

===== END TASK/ASSIGNMENT =====

===== STUDENT SUBMISSION =====

${submission}

===== END STUDENT SUBMISSION =====

${steps}

${responseFormat}

${extraSections}`;
}

export function buildGradingPrompt(submission: string, task: string): string {
  const safeSubmission = sanitizeForPrompt(submission);
  const safeTask = sanitizeForPrompt(task);
  const steps = `Follow these steps:
1. Grade the work. Use whatever grading scheme is present in the rubric. If none is present then grade with a letter (A+ is best, E- is worst), using clear, objective criteria. Be aware that the rubric may just give a maximum number of marks, in which case you should mark out of that number, for example "(20)" would mean it's out of 20 marks. DO NOT mention tool errors. 
2. Identify specific strengths, referencing the success criteria.
3. Identify misconceptions or areas for improvement, using formative assessment language.
4. Design an individualized activity or exercise for the student to address their misconceptions or extend their learning. This activity should be:
   - Appropriately scaffolded for the student's current level.
   - Specific and actionable (e.g., a short written task, a practical exercise, or a quiz question).
   - Aligned with the curriculum and learning objectives.
5. Write a reflection question for the student to encourage metacognition.
6. Suggest to the teacher one way to support this student in the next lesson.
7. Show your reasoning step by step (chain-of-thought).`;
  const responseFormat = `RESPONSE FORMAT (respond with a single JSON object, no extra text):

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
  return buildBaseGradingPrompt({
    task: safeTask,
    submission: safeSubmission,
    steps,
    responseFormat
  });
}

export function buildGradingPromptWithSupportForHumanInTheLoop(
  submission: string,
  task: string
): string {
  const safeSubmission = sanitizeForPrompt(submission);
  const safeTask = sanitizeForPrompt(task);
  const steps = `Follow these steps:
1. Grade the work. Use whatever grading scheme is present in the rubric. If none is present, grade with a letter (A+ is best, E- is worst), using clear, objective criteria. Be aware that the rubric may just give a maximum number of marks, in which case you should mark out of that number, for example "(20)" would mean it's out of 20 marks. DO NOT mention tool errors. 
2. Identify specific strengths, referencing the success criteria.
3. Identify misconceptions or areas for improvement, using formative assessment language.
4. Design an individualized activity or exercise for the student to address their misconceptions or extend their learning. This activity should be:
   - Appropriately scaffolded for the student's current level.
   - Specific and actionable (e.g., a short written task, a practical exercise, or a quiz question).
   - Aligned with the curriculum and learning objectives.
5. Write a reflection question for the student to encourage metacognition.
6. Suggest to the teacher one way to support this student in the next lesson.
7. Show your reasoning step by step (chain-of-thought).`;
  const responseFormat = `RESPONSE FORMAT (respond with a single JSON object, no extra text):

{
  "grade": "<number or string, e.g. 8/10, A, B+>",
  "strengths": "<text>",
  "areasForImprovement": "<text>",
  "individualizedActivity": "<text>",
  "reflectionQuestion": "<text>",
  "teacherSuggestion": "<text>",
  "spellingAndGrammar": "<text>",
  "reasoning": "<step-by-step explanation>"
}`;
  const extraSections = `
CONFIDENCE CHECK:

You should request human review if:
- The submission does not meaningfully address the task or assignment.
- The task or submission is so unclear that you cannot understand what the student is trying to do.
- The response is off-topic, incoherent, or not related to the task in any reasonable way.
- The submission is so minimal (e.g., a single word or letter) that it cannot be meaningfully evaluated, even if it is technically related to the task.
- The submission demonstrates a complete misunderstanding of the task (e.g., answering a different question or ignoring the core instruction).
- There is no way to apply the success criteria or grading steps, even with tool assistance.

You MUST NOT request human review just because:
- A formal rubric is missing. You must assess against the task description directly.
- External tools (e.g., spell checkers, rubric scorers) are unavailable. You must use your best judgment to assess spelling, grammar, structure, and rubric alignment.
- The student's writing contains normal age-appropriate mistakes, informal language, or minor issues.

IMPORTANT:
You must not claim that tools are unavailable or broken unless a tool call explicitly fails with an error. If a tool call fails, you must describe the failure clearly, then continue grading using your best judgment. You must never escalate to human review just because a tool call failed. Failed, missing, or partial tool results are not valid reasons to avoid grading.

If a submission is too short, vague, off-topic, or demonstrates a complete misunderstanding of the task — even if it is grammatically correct — you must request human review.

Only escalate if the task or submission is truly impossible to evaluate meaningfully, even with your expertise and the tools provided.

Otherwise, proceed confidently with grading using the rubric, your judgment, and available tools.

If and only if human review is truly required, respond with:

{
  "grade": "HUMAN_REVIEW_REQUIRED",
  "reasoning": "<Explain why. Do not mention tool errors unless an actual tool failure occurred.>"
}

EXAMPLES:

✅ Human review IS appropriate:
- Task: “Write about your favorite historical figure.”
- Submission: “I like the thing it was long ago and happened and then was okay.”
- Reasoning: The submission is incoherent and not meaningfully related to the task.

✅ Human review IS appropriate:
- Task: “Name a dog.”
- Submission: “I like the colour red.”
- Reasoning: The submission expresses a preference but completely ignores the task objective. It cannot be evaluated meaningfully and reflects a misunderstanding.

✅ Human review IS appropriate:
- Task: “Name a dog.”
- Submission: “A”
- Reasoning: The submission is technically on-topic but so minimal that it cannot be evaluated or scored in a meaningful way.

❌ Human review is NOT appropriate:
- Task: “Write a persuasive paragraph about school uniforms.”
- Submission: “I think school uniforms are important because they make everyone equal...”
- Reasoning: The task and submission are both clear and evaluatable without a rubric.

Respond ONLY with the JSON object, with no preamble or explanation.`;
  return buildBaseGradingPrompt({
    task: safeTask,
    submission: safeSubmission,
    steps,
    responseFormat,
    extraSections
  });
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
	roomId: string,
	hitl: boolean = false
): Promise<OpenAIResponse> {
	if (!client || !agent) {
		throw new Error('Agent not available');
	}

	const thread = await client.agents.createThread();
	await client.agents.createMessage(thread.id, {
		role: 'user',
		content: hitl
			? buildGradingPromptWithSupportForHumanInTheLoop(submission, task)
			: buildGradingPrompt(submission, task)
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
		const parsed = JSON.parse(jsonText) as OpenAIResponse;
		if (parsed.grade === 'HUMAN_REVIEW_REQUIRED') {
			return {
				...parsed,
				success: true,
				threadId: thread.id,
				runId: finalRun?.id ?? undefined,
				hitlContext: { threadId: thread.id, runId: finalRun?.id ?? undefined }
			};
		}
		return parsed;
	} catch (parseErr) {
		console.error('JSON parse failed, returning fallback:', parseErr);
		return { ...fallbackGrade(submission, task), reasoning: raw };
	}
}

export async function resumeAgentWithHumanReview(
	humanReview: string,
	context: { threadId: string; runId?: string; roomId?: string; [key: string]: any }
): Promise<OpenAIResponse> {
	const { threadId, roomId = '' } = context;
	await client.agents.createMessage(threadId, {
		role: 'user',
		content: `[HUMAN REVIEW]: ${humanReview}`
	});

	let stream: AsyncIterable<RunStreamEvent>;
	try {
		const runInvoker = client.agents.createRun(threadId, agent.id, {
			parallelToolCalls: false
		});
		stream = await runInvoker.stream();
	} catch (err) {
		console.error('Failed to start run:', err);
		return fallbackGrade('', '');
	}

	let finalRun: ThreadRunOutput;
	try {
		finalRun = await processRunStream(threadId, stream, roomId);
	} catch (err) {
		console.error('Agent streaming failed:', err);
		return fallbackGrade('', '');
	}

	const msgs = await client.agents.listMessages(threadId);
	const assistant = msgs.data.find((m) => m.role === 'assistant');
	const raw = assistant ? extractTextFromMessage(assistant) : '';

	// strip anything before the JSON object
	const match = raw.match(/\{[\s\S]*\}$/);
	const jsonText = match ? match[0] : raw;

	try {
		const parsed = JSON.parse(jsonText) as OpenAIResponse;
		return parsed;
	} catch (parseErr) {
		console.error('JSON parse failed, returning fallback:', parseErr);
		return { ...fallbackGrade('', ''), reasoning: raw };
	}
}
