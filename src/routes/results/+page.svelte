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

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-100 text-blue-700 px-2 py-1 rounded">Skip to main content</a>
<section id="main-content" class="max-w-4xl mx-auto py-12">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Assessment Results</h1>
    <a href="/upload" class="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition" aria-label="Back to upload page">Back to Upload</a>
  </div>
  <p class="mb-6">View detailed feedback and recommendations for each student submission.</p>
  {#if feedback}
    <div aria-live="polite" role="region">
      <AssessmentFeedback {...feedback} />
    </div>
  {/if}
  {#if !feedback && (!history || history.length === 0)}
    <div class="border rounded p-6 text-gray-500" aria-live="polite" role="status">No results yet. Upload submissions to see feedback here.</div>
  {/if}
  {#if history.length > 0}
    <div class="flex justify-end mt-6">
      <button class="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition" on:click={confirmClearHistory} aria-label="Clear all assessment history">Clear History</button>
    </div>
  {/if}
  <AssessmentHistory {history} hideIfEmpty={true} on:delete={deleteEntry} />
</section>

<script lang="ts" context="module">
export function confirmClearHistory() {
  if (window.confirm('Are you sure you want to clear all assessment history? This action cannot be undone.')) {
    localStorage.removeItem('assessmentHistory');
    window.location.reload();
  }
}
export function deleteEntry(event: CustomEvent) {
  const timestamp = event.detail;
  if (window.confirm('Delete this assessment entry? This action cannot be undone.')) {
    let prev = [];
    try {
      prev = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    } catch {}
    prev = prev.filter((entry: any) => entry.timestamp !== timestamp);
    localStorage.setItem('assessmentHistory', JSON.stringify(prev));
    window.location.reload();
  }
}
</script>
