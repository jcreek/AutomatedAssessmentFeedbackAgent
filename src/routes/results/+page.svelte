<script lang="ts">
import AssessmentFeedback from '$lib/components/AssessmentFeedback.svelte';
import { onMount } from 'svelte';

let feedback: any = null;

onMount(() => {
  // For hackathon simplicity, get feedback from history state
  if (window.history.state && window.history.state.feedback) {
    feedback = window.history.state.feedback;
  }
});
</script>

<section class="max-w-xl mx-auto py-12">
  <h1 class="text-2xl font-bold mb-4">Assessment Results</h1>
  <p class="mb-6">View detailed feedback and recommendations for each student submission.</p>
  {#if feedback}
    <AssessmentFeedback {...feedback} />
  {:else}
    <div class="border rounded p-6 text-gray-500">No results yet. Upload submissions to see feedback here.</div>
  {/if}
</section>
