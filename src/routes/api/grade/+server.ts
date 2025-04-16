import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// TODO - don't just mock the grading logic
export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.formData();
  const file = data.get('file');
  const text = data.get('text');

  // Simulation of grading and feedback
  let feedback = '';
  if (file) {
    feedback = 'Received file: ' + (file as File).name + '. [AI feedback coming soon]';
  } else if (typeof text === 'string' && text.trim().length > 0) {
    feedback = 'Received text submission. [AI feedback coming soon]';
  } else {
    return new Response(JSON.stringify({ error: 'No valid input provided.' }), { status: 400 });
  }

  // Return mock feedback for now
  return new Response(JSON.stringify({ success: true, feedback }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
