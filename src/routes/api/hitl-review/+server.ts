import type { RequestHandler } from '@sveltejs/kit';
import { resumeAgentWithHumanReview } from '$lib/server/ai';

export const POST: RequestHandler = async (event) => {
	try {
		const { humanReview, context } = await event.request.json();
		const aiResult = await resumeAgentWithHumanReview(humanReview, context);
		return new Response(
			JSON.stringify({
				success: true,
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
