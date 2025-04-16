import type { OpenAIResponse } from './types';

const OPENAI_API_KEY = process.env['AZURE_OPENAI_API_KEY'];
const OPENAI_ENDPOINT = process.env['AZURE_OPENAI_ENDPOINT'];
const OPENAI_DEPLOYMENT = process.env['AZURE_OPENAI_DEPLOYMENT'] || 'gpt-4';

// Prompt template for grading and feedback
export function buildGradingPrompt(submission: string) {
  return `You are an expert secondary school teacher and AI assessment agent. Assess the following student submission using the following steps:
1. Grade the work out of 10, using clear, objective criteria.
2. Identify specific strengths, referencing the success criteria.
3. Identify misconceptions or areas for improvement, using formative assessment language.
4. Design an individualized activity or exercise for the student to address their misconceptions or extend their learning. This activity should be:
   - Appropriately scaffolded for the student's current level.
   - Specific and actionable (e.g., a short written task, a practical exercise, or a quiz question).
   - Aligned with the curriculum and learning objectives.
5. Write a reflection question for the student to encourage metacognition.
6. Suggest to the teacher one way to support this student in the next lesson.
7. Show your reasoning step by step (chain-of-thought).

STUDENT SUBMISSION:
${submission}

RESPONSE FORMAT:
Grade: <number>/10
Strengths: <text>
Areas for Improvement: <text>
Individualized Activity: <text>
Reflection Question: <text>
Teacher Suggestion: <text>
Reasoning: <step-by-step explanation>`;
}

export async function gradeWithOpenAI(submission: string): Promise<OpenAIResponse> {
  if (!OPENAI_API_KEY || !OPENAI_ENDPOINT) {
    // Fallback for local/demo mode
    return {
      grade: '7/10',
      strengths: 'Clear argument and good evidence.',
      areas_for_improvement: 'Needs deeper analysis and more examples.',
      individualized_activity: 'Write a paragraph expanding on your main point and provide two additional examples to support your argument.',
      reflection_question: 'What was the most challenging part of this assignment for you, and why?',
      teacher_suggestion: 'In the next lesson, review how to develop arguments with supporting evidence and provide a model answer for comparison.',
      reasoning: 'The submission demonstrates a good structure and evidence, but lacks depth and breadth of analysis. The activity and suggestions are designed to target this gap.'
    };
  }

  const prompt = buildGradingPrompt(submission);

  const res = await fetch(`${OPENAI_ENDPOINT}/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': OPENAI_API_KEY
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful, fair, and transparent grading assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.2,
      stream: false
    })
  });

  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse the response using regex
  const gradeMatch = content.match(/Grade:\s*(.*)/i);
  const strengthsMatch = content.match(/Strengths:\s*([\s\S]*?)Areas for Improvement:/i);
  const improvementMatch = content.match(/Areas for Improvement:\s*([\s\S]*?)Individualized Activity:/i);
  const activityMatch = content.match(/Individualized Activity:\s*([\s\S]*?)Reflection Question:/i);
  const reflectionMatch = content.match(/Reflection Question:\s*([\s\S]*?)Teacher Suggestion:/i);
  const teacherSuggestionMatch = content.match(/Teacher Suggestion:\s*([\s\S]*?)Reasoning:/i);
  const reasoningMatch = content.match(/Reasoning:\s*([\s\S]*)/i);

  return {
    grade: gradeMatch?.[1]?.trim() || '',
    strengths: strengthsMatch?.[1]?.trim() || '',
    areas_for_improvement: improvementMatch?.[1]?.trim() || '',
    individualized_activity: activityMatch?.[1]?.trim() || '',
    reflection_question: reflectionMatch?.[1]?.trim() || '',
    teacher_suggestion: teacherSuggestionMatch?.[1]?.trim() || '',
    reasoning: reasoningMatch?.[1]?.trim() || ''
  };
}
