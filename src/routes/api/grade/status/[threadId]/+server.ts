import { json, type RequestHandler } from '@sveltejs/kit';
import { client } from '$lib/agent/services/agentService';
import { error } from '@sveltejs/kit';
import type { ThreadRunOutput } from '@azure/ai-projects';

export const GET: RequestHandler = async ({ params }) => {
    const { threadId } = params;
    
    if (!threadId) {
        throw error(400, 'Thread ID is required');
    }

    try {
        // Get the thread to check if it exists
        const thread = await client.agents.getThread(threadId);
        if (!thread) {
            throw error(404, 'Thread not found');
        }

        // Get the latest run for this thread
        const runs = await client.agents.listRuns(threadId);
        const latestRun = runs.data[0];

        if (!latestRun) {
            return json({
                status: 'completed',
                message: 'No runs found for this thread'
            });
        }

        // Get the run status
        const run = await client.agents.getRun(threadId, latestRun.id);
        
        // Get the latest messages to see if we have a result
        const messages = await client.agents.listMessages(threadId);
        const assistantMessage = messages.data.find((m: any) => m.role === 'assistant');
        let result = null;

        if (assistantMessage) {
            const raw = assistantMessage.content
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.text.value)
                .join('\n');

            // Try to parse the JSON response
            try {
                const match = raw.match(/\{[\s\S]*\}$/);
                const jsonText = match ? match[0] : raw;
                result = JSON.parse(jsonText);
            } catch (e) {
                // If we can't parse JSON, return the raw text
                result = { raw };
            }
        }

        return json({
            status: run.status,
            runId: run.id,
            threadId,
            result,
            completed: ['completed', 'failed', 'cancelled', 'expired'].includes(run.status)
        });
    } catch (err: any) {
        console.error('Error checking status:', err);
        throw error(500, `Error checking status: ${err.message}`);
    }
};
