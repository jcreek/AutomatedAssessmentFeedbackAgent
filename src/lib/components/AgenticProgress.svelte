<script lang="ts">
  import {
    rubricMatcherToolMeta,
    essayAnalyzerToolMeta,
    conceptVerifierToolMeta,
    feedbackGeneratorToolMeta,
    metacognitiveReflectionPromptToolMeta,
    selfAssessmentToolMeta,
    spellingAndGrammarCheckerToolMeta
  } from '$lib/agent/tools';

  export let toolEvents: Array<{ tool: string, time: string }> = [];

  // Map keys to meta objects for lookup
  const TOOL_META_MAP: Record<string, { userDescription: string; icon: string }> = {
    [rubricMatcherToolMeta.key]: rubricMatcherToolMeta,
    [essayAnalyzerToolMeta.key]: essayAnalyzerToolMeta,
    [conceptVerifierToolMeta.key]: conceptVerifierToolMeta,
    [feedbackGeneratorToolMeta.key]: feedbackGeneratorToolMeta,
    [metacognitiveReflectionPromptToolMeta.key]: metacognitiveReflectionPromptToolMeta,
    [selfAssessmentToolMeta.key]: selfAssessmentToolMeta,
    [spellingAndGrammarCheckerToolMeta.key]: spellingAndGrammarCheckerToolMeta
  };

  // Build steps from toolEvents, filling in status, icon, and userDescription
  $: steps = toolEvents.map((event, idx) => {
    const meta = TOOL_META_MAP[event.tool];
    return {
      description: meta ? meta.userDescription : event.tool,
      icon: meta ? meta.icon : '🤖',
      status: idx < toolEvents.length - 1 ? 'done' : 'running',
      time: event.time
    };
  });
  // If no events yet, show agent 'thinking'
  $: agentThinking = toolEvents.length === 0;
  $: statusMessage = agentThinking
    ? 'The AI Agent is analyzing your submission and selecting the best tools...'
    : 'The AI Agent is now processing your submission...';
  $: liveMessage = agentThinking
    ? statusMessage
    : steps.length > 0
      ? steps[steps.length - 1].description
      : statusMessage;
</script>

<style>
  .agent-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
  }
  .agent-avatar {
    font-size: 3rem;
    margin-bottom: 1rem;
    user-select: none;
  }
  .status-message {
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .progress-bar-bg {
    width: 100%;
    max-width: 400px;
    height: 10px;
    background: #e0e7ef;
    border-radius: 5px;
    margin-bottom: 2rem;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #5b9df9 0%, #4ade80 100%);
    transition: width 0.5s;
  }
  ul.steps {
    list-style: none;
    padding: 0;
    width: 100%;
    max-width: 400px;
  }
  li.step {
    display: flex;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    background: #f8fafc;
    font-size: 1.05rem;
    outline: none;
  }
  li.step[aria-current="step"] {
    background: #e0f2fe;
    font-weight: bold;
  }
  .step-icon {
    margin-right: 1rem;
    font-size: 1.5rem;
    min-width: 2rem;
    text-align: center;
  }
  .visually-hidden {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
</style>

<div class="agent-container" role="region" aria-label="Submission Processing">
  <div class="agent-avatar" aria-hidden="true">🤖</div>
  <div class="status-message" id="agent-status">{statusMessage}</div>
  <div class="progress-bar-bg" aria-hidden="true">
    <div
      class="progress-bar-fill"
      style="width: {steps.length ? ((steps.filter(s => s.status === 'done').length) / (steps.length)) * 100 : 0}%"
    ></div>
  </div>
  <div aria-live="polite" class="visually-hidden">{liveMessage}</div>
  <ul class="steps" aria-label="Processing steps">
    {#if agentThinking}
      <li class="step" aria-current="step">
        <span class="step-icon" aria-hidden="true">💡</span>
        <span>AI Agent is analyzing your submission…</span>
      </li>
    {:else}
      {#each steps as step, idx}
        <li class="step {step.status}">
          <span class="step-icon" aria-hidden="true">{step.icon}</span>
          <span class="step-desc">{step.description}</span>
          <span class="step-time">{new Date(step.time).toLocaleTimeString()}
            {step.status === 'done'
              ? '✅'
              : step.status === 'running'
                ? '⏳'
                : '🛠️'}
          </span>
        </li>
      {/each}
    {/if}
  </ul>
</div>
