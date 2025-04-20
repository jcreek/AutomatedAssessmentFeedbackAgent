import { client, agent } from '../agent/services/agentService';
import type { MessageTextContentOutput, ToolOutput } from '@azure/ai-projects';

const OPENAI_API_KEY = process.env['AZURE_OPENAI_API_KEY'];
const OPENAI_ENDPOINT = process.env['AZURE_OPENAI_ENDPOINT'];
const OPENAI_DEPLOYMENT = process.env['AZURE_OPENAI_DEPLOYMENT'] || 'gpt-4';

// Prompt template for grading and feedback
export function buildGradingPrompt(submission: string, task: string) {
  return `You are an expert secondary school teacher and AI assessment agent. Assess the following student submission in the context of the assignment/task provided.

TASK/ASSIGNMENT:
${task}

STUDENT SUBMISSION:
${submission}

Follow these steps:
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

RESPONSE FORMAT (respond with a single JSON object, no extra text):

{
  "grade": "<number or string, e.g. 8/10 or 8>",
  "strengths": "<text>",
  "areas_for_improvement": "<text>",
  "individualized_activity": "<text>",
  "reflection_question": "<text>",
  "teacher_suggestion": "<text>",
  "reasoning": "<step-by-step explanation>"
}

Respond ONLY with the JSON object, with no preamble or explanation.
`;
}

export type OpenAIResponse = {
  grade: string;
  strengths: string;
  areas_for_improvement: string;
  individualized_activity: string;
  reflection_question: string;
  teacher_suggestion: string;
  reasoning: string;
};

function fallbackGrade(submission: string, task: string): OpenAIResponse {
  console.log('using fallback');
  return {
    grade: '7/10',
    strengths: 'Clear argument and good evidence (in response to the task: ' + task + ").",
    areas_for_improvement: 'Needs deeper analysis and more examples.',
    individualized_activity: 'Write a paragraph expanding on your main point and provide two additional examples to support your argument.',
    reflection_question: 'What was the most challenging part of this assignment for you, and why?',
    teacher_suggestion: 'In the next lesson, review how to develop arguments with supporting evidence and provide a model answer for comparison.',
    reasoning: 'The submission demonstrates a good structure and evidence, but lacks depth and breadth of analysis. The activity and suggestions are designed to target this gap.'
  };
}

export async function gradeSubmissionWithAgent(submission: string, task: string): Promise<OpenAIResponse> {
  try {
    if (!client || !agent) throw new Error('Agent not available');

    // 1. Create a new thread
    const thread = await client.agents.createThread();

    // 2. Add a message to the thread
    await client.agents.createMessage(thread.id, {
      role: 'user',
      content: buildGradingPrompt(submission, task)
    });

    // 3. Run the agent
    const run = await client.agents.createRun(thread.id, agent.id, {});

    // 4. Poll for run completion
    let runResult;
    for (let i = 0; i < 60; i++) { // up to ~60 seconds
      runResult = await client.agents.getRun(thread.id, run.id);
      console.log('Agent run status:', runResult.status);

      if (runResult.status === 'completed') break;
      if (runResult.status === 'failed') {
        const messages = await client.agents.listMessages(thread.id);
        const agentMessage = messages.data.find((m: { role: string; content: any[] }) => m.role === 'agent');
        let errorText = '';
        if (agentMessage && Array.isArray(agentMessage.content) && agentMessage.content.length > 0) {
          const contentItem = agentMessage.content[0];
          if (contentItem.type === 'text' && contentItem.text && typeof contentItem.text.value === 'string') {
            errorText = contentItem.text.value;
          } else if (typeof contentItem.value === 'string') {
            errorText = contentItem.value;
          }
        }
        throw new Error(`Agent run failed. Status: failed. Message: ${errorText}`);
      }

      // Handle tool calls if agent requires action
      if (runResult.status === 'requires_action' && runResult.requiredAction?.submitToolOutputs.toolCalls) {
        const toolCalls = runResult.requiredAction.submitToolOutputs.toolCalls;
        const toolOutputs: ToolOutput[] = await Promise.all(toolCalls.map(async (call: any) => {
          let output = '';
          const args = JSON.parse(call.function.arguments);

          if (
            call.function.name === 'matchRubric' ||
            call.function.name === 'analyzeEssay'
          ) {
            // LLM will handle the tool logic, just submit empty output
            output = '';
          } else {
            output = `Unknown tool: ${call.function.name}`;
          }

          return {
            toolCallId: call.id,
            output: typeof output === 'string' ? output : JSON.stringify(output)
          };
        }));
        await client.agents.submitToolOutputsToRun(thread.id, run.id, toolOutputs);
      }

      await new Promise(res => setTimeout(res, 1000));
    }
    if (!runResult || runResult.status !== 'completed') {
      const messages = await client.agents.listMessages(thread.id);
      const agentMessage = messages.data.find((m: { role: string; content: any[] }) => m.role === 'agent');
      let errorText = '';
      if (agentMessage && Array.isArray(agentMessage.content) && agentMessage.content.length > 0) {
        const contentItem = agentMessage.content[0];
        if (contentItem.type === 'text' && contentItem.text && typeof contentItem.text.value === 'string') {
          errorText = contentItem.text.value;
        } else if (typeof contentItem.value === 'string') {
          errorText = contentItem.value;
        }
      }
      throw new Error(`Agent run did not complete in time. Last status: ${runResult?.status}. Last message: ${errorText}`);
    }

    // 5. Get agent's feedback message
    const messages = await client.agents.listMessages(thread.id);
    const agentMessage = messages.data.find((m: { role: string; content: any[] }) => m.role === 'assistant');
    // Safely extract text content from agent message
    let text = '';
    if (agentMessage && Array.isArray(agentMessage.content) && agentMessage.content.length > 0) {
      const contentItem = agentMessage.content[0];
      if (contentItem.type === 'text' && 'text' in contentItem) {
        text = (contentItem as MessageTextContentOutput).text.value;
      } else if ('value' in contentItem && typeof (contentItem as any).value === 'string') {
        text = (contentItem as any).value;
      }
    }

    // 6. Parse agent's response into OpenAIResponse format
    let parsed: OpenAIResponse | null = null;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error(err);
    }
    if (parsed && typeof parsed === 'object' && parsed.grade) {
      return parsed;
    }
    // If parsing fails, return raw text in reasoning
    return {
      grade: '',
      strengths: '',
      areas_for_improvement: '',
      individualized_activity: '',
      reflection_question: '',
      teacher_suggestion: '',
      reasoning: text || 'No feedback generated.'
    };
  } catch (err) {
    console.error(err);
    // Fallback to local/demo logic
    return fallbackGrade(submission, task);
  }
}
