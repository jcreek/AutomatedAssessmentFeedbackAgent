<script lang="ts">
  export let grade: string = '';
  export let strengths: string = '';
  export let areas_for_improvement: string = '';
  export let individualized_activity: string = '';
  export let reflection_question: string = '';
  export let teacher_suggestion: string = '';
  export let reasoning: string = '';
</script>

<section class="max-w-xl mx-auto bg-white rounded shadow p-6 mt-8">
  <h2 class="text-xl font-bold mb-4 text-blue-700">AI Assessment Feedback</h2>
  <div class="mb-2"><span class="font-semibold">Grade:</span> {grade}</div>
  <div class="mb-2"><span class="font-semibold">Strengths:</span> {strengths}</div>
  <div class="mb-2"><span class="font-semibold">Areas for Improvement:</span> {areas_for_improvement}</div>
  <div class="mb-2"><span class="font-semibold">Individualized Activity:</span> {individualized_activity}</div>
  <div class="mb-2"><span class="font-semibold">Reflection Question:</span> {reflection_question}</div>
  <div class="mb-2"><span class="font-semibold">Teacher Suggestion:</span> {teacher_suggestion}</div>
  <details class="mt-4">
    <summary class="cursor-pointer font-semibold text-gray-600">Show AI Reasoning</summary>
    <div class="mt-2 text-gray-700 whitespace-pre-line">{reasoning}</div>
  </details>
</section>
