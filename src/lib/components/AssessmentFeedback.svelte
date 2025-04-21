<script lang="ts">
  export let grade: string = '';
  export let strengths: string = '';
  export let areasForImprovement: string = '';
  export let individualizedActivity: string = '';
  export let reflectionQuestion: string = '';
  export let teacherSuggestion: string = '';
  export let spellingAndGrammar: string = '';
  export let reasoning: string = '';
</script>

<section class="max-w-4xl mx-auto bg-white rounded shadow p-6 mt-8">
  <h2 class="text-xl font-bold mb-4 text-blue-700">AI Assessment Feedback</h2>
  <div class="mb-2"><span class="font-semibold">Grade:</span> {grade}</div>
  <div class="mb-2"><span class="font-semibold">Strengths:</span> {strengths}</div>
  <div class="mb-2"><span class="font-semibold">Areas for Improvement:</span> {areasForImprovement}</div>
  <div class="mb-2"><span class="font-semibold">Individualized Activity:</span> {individualizedActivity}</div>
  <div class="mb-2"><span class="font-semibold">Reflection Question:</span> {reflectionQuestion}</div>
  <div class="mb-2"><span class="font-semibold">Teacher Suggestion:</span> {teacherSuggestion}</div>
  <div class="mb-2"><span class="font-semibold">Spelling and Grammar:</span> {spellingAndGrammar}</div>
  <details class="mt-4">
    <summary class="cursor-pointer font-semibold text-gray-600">Show AI Reasoning</summary>
    <div class="mt-2 text-gray-700 whitespace-pre-line">{reasoning}</div>
  </details>
</section>
