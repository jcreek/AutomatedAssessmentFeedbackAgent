import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { client } from '$lib/agent/services/agentService';
import { buildGradingPrompt, buildGradingPromptWithSupportForHumanInTheLoop } from '$lib/server/ai';
import { error, json } from '@sveltejs/kit';

interface GradingRequest {
    submission: string;
    task: string;
    roomId?: string;
    hitl?: boolean;
}

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
            throw error(400, 'Task/assignment description is required.');
        }

        if (file && typeof file === 'object' && 'arrayBuffer' in file && 'name' in file) {
            // Only support .txt for now for hackathon speed
            const fileObj = file as File;
            if (!fileObj.name.endsWith('.txt')) {
                throw error(400, 'Only .txt files are supported at this time.');
            }
            const buffer = await fileObj.arrayBuffer();
            submission = new TextDecoder('utf-8').decode(buffer);
        } else if (typeof text === 'string' && text.trim().length > 0) {
            submission = text.trim();
        } else {
            throw error(400, 'No valid input provided.');
        }

        // Create a new thread
        const thread = await client.agents.createThread();
        
        // Add the initial message with the grading prompt
        await client.agents.createMessage(thread.id, {
            role: 'user',
            content: hitl
                ? buildGradingPromptWithSupportForHumanInTheLoop(submission, task.trim())
                : buildGradingPrompt(submission, task.trim())
        });

        // Start the run asynchronously
        const run = await client.agents.createRun(thread.id, (globalThis as any).agent.id, {
            parallelToolCalls: false
        });

        // Return immediately with the thread ID for polling
        return json({
            success: true,
            threadId: thread.id,
            runId: run.id,
            status: 'started',
            statusUrl: `/api/grade/status/${thread.id}`
        });
    } catch (err: any) {
        console.error('Error starting grading operation:', err);
        throw error(500, `Error starting grading operation: ${err.message}`);
    }
};
