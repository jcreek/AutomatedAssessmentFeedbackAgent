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
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
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
  ul.tool-steps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 0;
    list-style: none;
    width: 100%;
  }
  li.tool-step-card {
    display: flex;
    align-items: center;
    background: #f3f6fa;
    border-radius: 14px;
    box-shadow: 0 2px 12px 0 rgba(44, 62, 80, 0.09);
    padding: 0.5rem;
    gap: 1.5rem;
    transition: box-shadow 0.2s, border 0.2s;
    outline: none;
    border: 2px solid #e0e7ef;
    min-height: 3.6rem;
    width: 100%;
    box-sizing: border-box;
  }
  .tool-step-icon {
    margin-right: 1.25rem;
    font-size: 2rem;
    min-width: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tool-step-desc {
    font-size: 1.05rem;
    font-weight: 500;
    color: #22223b;
    flex: 1 1 auto;
    margin-right: 2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tool-step-time {
    font-size: 0.97rem;
    color: #64748b;
    margin-right: 1.5rem;
    min-width: 4.2rem;
    text-align: right;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tool-step-status {
    font-size: 1.45rem;
    margin-left: 0.5rem;
    width: 2.2rem;
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #e0f2fe;
    color: #2563eb;
    font-weight: bold;
    box-shadow: 0 1px 3px 0 rgba(44, 62, 80, 0.07);
    flex-shrink: 0;
  }
  .tool-step-card:focus {
    border: 2px solid #60a5fa;
    box-shadow: 0 0 0 3px #bae6fd;
  }
  .tool-step-card.running {
    border-color: #60a5fa;
    background: #e8f1fb;
  }
  .tool-step-card.done {
    border-color: #22c55e;
  }
  .tool-step-icon {
    margin-right: 1rem;
    font-size: 1.5rem;
    min-width: 2rem;
    text-align: center;
  }
  .tool-step-desc {
    font-size: 1.05rem;
  }
  .tool-step-time {
    font-size: 0.9rem;
    color: #6b7280;
  }
  .tool-step-status {
    margin-left: auto;
    font-size: 1.2rem;
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
  <ul class="tool-steps" aria-label="Processing steps">
  {#if agentThinking}
    <li class="tool-step-card" aria-current="step" tabindex="0">
      <span class="tool-step-icon" aria-hidden="true">💡</span>
      <span class="tool-step-desc">The AI Agent is analyzing your submission…</span>
    </li>
  {:else}
    {#each steps as step, idx}
      <li class="tool-step-card {step.status}" tabindex="0" aria-current={step.status === 'running' ? 'step' : undefined}>
        <span class="tool-step-icon" aria-hidden="true">{step.icon}</span>
        <span class="tool-step-desc">{step.description}</span>
        <span class="tool-step-time">{new Date(step.time).toLocaleTimeString()}</span>
        <span class="tool-step-status" aria-label={step.status === 'done' ? 'Completed' : step.status === 'running' ? 'In progress' : 'Pending'}>
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
