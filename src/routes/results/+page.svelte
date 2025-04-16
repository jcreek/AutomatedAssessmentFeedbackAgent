<script lang="ts">
import AssessmentFeedback from '$lib/components/AssessmentFeedback.svelte';
import AssessmentHistory from '$lib/components/AssessmentHistory.svelte';
import { onMount } from 'svelte';

let feedback: any = null;
let history: any[] = [];

function saveToHistory(entry: any) {
  let prev = [];
  try {
    prev = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
  } catch {}
  prev.unshift(entry); // latest first
  localStorage.setItem('assessmentHistory', JSON.stringify(prev.slice(0, 50)));
}

onMount(() => {
  try {
    history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    if (history && history.length > 0) {
      feedback = history[0]; // Show latest as most prominent feedback
    } else {
      feedback = null;
    }
  } catch {
    history = [];
    feedback = null;
  }
});
</script>

<section class="max-w-xl mx-auto py-12">
  <h1 class="text-2xl font-bold mb-4">Assessment Results</h1>
  <p class="mb-6">View detailed feedback and recommendations for each student submission.</p>
  {#if feedback}
    <AssessmentFeedback {...feedback} />
  {/if}
  {#if !feedback && (!history || history.length === 0)}
    <div class="border rounded p-6 text-gray-500">No results yet. Upload submissions to see feedback here.</div>
  {/if}
  <AssessmentHistory {history} hideIfEmpty={true} />
</section>
