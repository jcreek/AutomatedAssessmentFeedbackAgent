import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { gradeSubmissionWithAgent } from '$lib/server/ai';

export const POST: RequestHandler = async (event: RequestEvent) => {
	try {
		const data = await event.request.formData();
		const file = data.get('file');
		const text = data.get('text');
		const task = data.get('task');
		const roomId = data.get('roomId') as string | undefined;
		const hitl = data.get('hitl') === 'true';
		let submission = '';

		if (!task || typeof task !== 'string' || !task.trim()) {
			return new Response(JSON.stringify({ error: 'Task/assignment description is required.' }), {
				status: 400
			});
		}

		if (file && typeof file === 'object' && 'arrayBuffer' in file && 'name' in file) {
			// Only support .txt for now for hackathon speed
			const fileObj = file as File;
			if (!fileObj.name.endsWith('.txt')) {
				return new Response(
					JSON.stringify({ error: 'Only .txt files are supported at this time.' }),
					{ status: 400 }
				);
			}
			const buffer = await fileObj.arrayBuffer();
			submission = new TextDecoder('utf-8').decode(buffer);
		} else if (typeof text === 'string' && text.trim().length > 0) {
			submission = text.trim();
		} else {
			return new Response(JSON.stringify({ error: 'No valid input provided.' }), { status: 400 });
		}

		// Call the AI grading agent with threading and fallback
		const aiResult = await gradeSubmissionWithAgent(submission, task.trim(), roomId ?? '', hitl);

		return new Response(
			JSON.stringify({
				success: true,
				task: task.trim(),
				feedback: `Suggested Grade: ${aiResult.grade}\nStrengths: ${aiResult.strengths}\nAreas for Improvement: ${aiResult.areasForImprovement}\nIndividualized Activity: ${aiResult.individualizedActivity}\nSpelling and Grammar: ${aiResult.spellingAndGrammar}\nReasoning: ${aiResult.reasoning}`,
				...aiResult
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
			status: 500
		});
	}
};
