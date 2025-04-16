<script lang="ts">
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
      <table class="min-w-full border text-sm rounded">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-3 border-b text-left">Date</th>
            <th class="py-2 px-3 border-b text-left">Task/Assignment</th>
            <th class="py-2 px-3 border-b text-left">Grade</th>
            <th class="py-2 px-3 border-b text-left">Actions</th>
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
                  <summary class="cursor-pointer text-blue-600 hover:underline">View</summary>
                  <div class="mt-2 p-2 bg-gray-50 rounded">
                    <div class="mb-1"><span class="font-semibold">Submission:</span> <span class="whitespace-pre-line">{entry.submission}</span></div>
                    <div class="mb-1"><span class="font-semibold">Strengths:</span> {entry.strengths}</div>
                    <div class="mb-1"><span class="font-semibold">Areas for Improvement:</span> {entry.areas_for_improvement}</div>
                    <div class="mb-1"><span class="font-semibold">Individualized Activity:</span> {entry.individualized_activity}</div>
                    <div class="mb-1"><span class="font-semibold">Reflection Question:</span> {entry.reflection_question}</div>
                    <div class="mb-1"><span class="font-semibold">Teacher Suggestion:</span> {entry.teacher_suggestion}</div>
                    <details class="mt-2">
                      <summary class="cursor-pointer font-semibold text-gray-600">Show AI Reasoning</summary>
                      <div class="mt-1 text-gray-700 whitespace-pre-line">{entry.reasoning}</div>
                    </details>
                  </div>
                </details>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
