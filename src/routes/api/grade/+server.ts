import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { gradeWithOpenAI } from '$lib/utils/ai';

export const POST: RequestHandler = async (event: RequestEvent) => {
  try {
    const data = await event.request.formData();
    const file = data.get('file');
    const text = data.get('text');
    let submission = '';

    if (file && typeof file === 'object' && 'arrayBuffer' in file && 'name' in file) {
      // Only support .txt for now for hackathon speed
      const fileObj = file as File;
      if (!fileObj.name.endsWith('.txt')) {
        return new Response(JSON.stringify({ error: 'Only .txt files are supported at this time.' }), { status: 400 });
      }
      const buffer = await fileObj.arrayBuffer();
      submission = new TextDecoder('utf-8').decode(buffer);
    } else if (typeof text === 'string' && text.trim().length > 0) {
      submission = text.trim();
    } else {
      return new Response(JSON.stringify({ error: 'No valid input provided.' }), { status: 400 });
    }

    // Call the AI grading agent
    const aiResult = await gradeWithOpenAI(submission);

    return new Response(JSON.stringify({
      success: true,
      feedback: `Grade: ${aiResult.grade}\nStrengths: ${aiResult.strengths}\nWeaknesses: ${aiResult.weaknesses}\nIndividualized Activity: ${aiResult.individualized_activity}\nReasoning: ${aiResult.reasoning}`,
      ...aiResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), { status: 500 });
  }
};
