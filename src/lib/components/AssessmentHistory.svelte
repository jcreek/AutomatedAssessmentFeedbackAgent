<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let history: any[] = [];
  export let hideIfEmpty: boolean = false;
</script>

{#if history.length === 0}
  {#if !hideIfEmpty}
    <div class="mt-8 text-gray-400 text-center">No previous assessments yet.</div>
  {/if}
{:else}
  <section class="mt-12">
    <h2 class="text-lg font-bold mb-4 text-gray-700">Assessment History</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full border text-sm rounded" aria-label="Assessment history table">
        <thead class="bg-gray-100">
          <tr>
            <th scope="col" class="py-2 px-3 border-b text-left">Date</th>
            <th scope="col" class="py-2 px-3 border-b text-left">Task/Assignment</th>
            <th scope="col" class="py-2 px-3 border-b text-left">Grade</th>
            <th scope="col" class="py-2 px-3 border-b text-left">Actions</th>
            <th scope="col" class="py-2 px-3 border-b text-left">Delete</th>
          </tr>
        </thead>
        <tbody>
          {#each history as entry (entry.timestamp)}
            <tr class="border-b hover:bg-gray-50">
              <td class="py-1 px-3">{new Date(entry.timestamp).toLocaleString()}</td>
              <td class="py-1 px-3 max-w-xs truncate" title={entry.task}>{entry.task}</td>
              <td class="py-1 px-3">{entry.grade}</td>
              <td class="py-1 px-3">
                <details>
                  <summary class="cursor-pointer text-blue-600 hover:underline" aria-label="View details for assessment on {new Date(entry.timestamp).toLocaleString()}">View</summary>
                  <div class="mt-2 p-2 bg-gray-50 rounded">
                    <div class="mb-1"><span class="font-semibold">Submission:</span> <span class="whitespace-pre-line">{entry.submission}</span></div>
                    <div class="mb-1"><span class="font-semibold">Strengths:</span> {entry.strengths}</div>
                    <div class="mb-1"><span class="font-semibold">Areas for Improvement:</span> {entry.areasForImprovement}</div>
                    <div class="mb-1"><span class="font-semibold">Individualized Activity:</span> {entry.individualizedActivity}</div>
                    <div class="mb-1"><span class="font-semibold">Reflection Question:</span> {entry.reflectionQuestion}</div>
                    <div class="mb-1"><span class="font-semibold">Teacher Suggestion:</span> {entry.teacherSuggestion}</div>
                    <div class="mb-1"><span class="font-semibold">Spelling and Grammar:</span> {entry.spellingAndGrammar}</div>
                    <details class="mt-2">
                      <summary class="cursor-pointer font-semibold text-gray-600" aria-label="Show AI reasoning for this assessment">Show AI Reasoning</summary>
                      <div class="mt-1 text-gray-700 whitespace-pre-line">{entry.reasoning}</div>
                    </details>
                  </div>
                </details>
              </td>
              <td class="py-1 px-3 text-center">
                <button class="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition text-xs" on:click={() => dispatch('delete', entry.timestamp)} aria-label={`Delete assessment from ${new Date(entry.timestamp).toLocaleString()}`}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
