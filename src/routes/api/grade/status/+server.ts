import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { client, agent } from '$lib/server/ai';

// GET /api/grade/status?threadId=...&runId=...
export const GET: RequestHandler = async (event: RequestEvent) => {
	const url = new URL(event.request.url);
	const threadId = url.searchParams.get('threadId');
	const runId = url.searchParams.get('runId');

	if (!client || !agent) {
		return new Response(JSON.stringify({ error: 'Agent not available' }), { status: 500 });
	}
	if (!threadId || !runId) {
		return new Response(JSON.stringify({ error: 'Missing threadId or runId' }), { status: 400 });
	}

	try {
		const run = await client.agents.getRun(threadId, runId);
		// Enhanced: handle all important statuses for polling
		let toolEvents = [];
		if (run.tool_calls) {
			toolEvents = run.tool_calls;
		}

		let result = null;
		let parsed = null;
		let humanReviewRequired = false;
		let parseError = null;

		// Handle agent run statuses for polling, mirroring processRunStream
		if (run.status === 'requires_action' && run.requiredAction) {
			return new Response(
				JSON.stringify({
					success: true,
					status: 'requires_action',
					requiredAction: run.requiredAction,
					toolCalls: run.requiredAction.submitToolOutputs?.toolCalls || [],
					toolEvents,
					message: 'Agent requires tool outputs to proceed.'
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}
		if (run.status === 'failed' || run.status === 'cancelling' || run.status === 'cancelled') {
			return new Response(
				JSON.stringify({
					success: false,
					status: run.status,
					toolEvents,
					error: run.lastError || 'Run failed or was cancelled.'
				}),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}
		if (run.status === 'in_progress' || run.status === 'queued' || run.status === 'starting') {
			return new Response(
				JSON.stringify({
					success: true,
					status: run.status,
					toolEvents,
					message: 'Grading in progress.'
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Completed and fallback handled below as before
		if (run.status === 'completed') {
			const msgs = await client.agents.listMessages(threadId);
			const assistant = msgs.data.find((m: any) => m.role === 'assistant');
			const raw = assistant ? (typeof assistant.content === 'string' ? assistant.content : (assistant.content?.[0]?.text || '')) : '';
			// strip anything before the JSON object
			const match = raw.match(/\{[\s\S]*\}$/);
			const jsonText = match ? match[0] : raw;
			try {
				parsed = JSON.parse(jsonText);
				if (parsed.grade === 'HUMAN_REVIEW_REQUIRED') {
					humanReviewRequired = true;
				}
				result = parsed;
			} catch (err: any) {
				parseError = err.message || 'Failed to parse AI response.';
				result = { raw };
			}
		}

		return new Response(
			JSON.stringify({
				success: true,
				status: run.status,
				toolEvents,
				result,
				humanReviewRequired,
				parseError
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message || 'Failed to get run status' }), { status: 500 });
	}
};
