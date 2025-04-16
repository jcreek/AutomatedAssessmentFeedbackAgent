<script lang="ts">
import { onMount } from 'svelte';

let file: File | null = null;
let textInput = '';
let taskDescription = '';
let submitting = false;
let successMsg = '';
let errorMsg = '';

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file = target.files[0];
    textInput = '';
  } else {
    file = null;
  }
  successMsg = '';
  errorMsg = '';
}

function handleTextChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  textInput = target.value;
  if (textInput.length > 0) file = null;
  successMsg = '';
  errorMsg = '';
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  submitting = true;
  successMsg = '';
  errorMsg = '';

  if (!taskDescription.trim()) {
    errorMsg = 'Please provide a description of the task or assignment.';
    submitting = false;
    return;
  }
  const formData = new FormData();
  formData.append('task', taskDescription.trim());
  if (file) {
    formData.append('file', file);
  } else if (textInput.trim().length > 0) {
    formData.append('text', textInput.trim());
  }

  try {
    const response = await fetch('/api/grade', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (response.ok && result.success) {
      // Save to localStorage history
      try {
        let prev = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        const entry = {
          timestamp: Date.now(),
          ...result,
          submission: result.submission || textInput || '',
          task: taskDescription,
        };
        prev.unshift(entry);
        localStorage.setItem('assessmentHistory', JSON.stringify(prev.slice(0, 50)));
      } catch {}
      // Redirect to /results
      window.location.assign('/results');
      file = null;
      textInput = '';
      taskDescription = '';
      return;
    } else {
      errorMsg = result.error || 'An error occurred.';
    }
  } catch (err) {
    errorMsg = 'Network or server error.';
  } finally {
    submitting = false;
  }
}

</script>

<section class="max-w-xl mx-auto py-12">
  <h1 class="text-2xl font-bold mb-4">Upload Student Submissions</h1>
  <p class="mb-6">Upload student assignments for instant AI-powered assessment and feedback.</p>
  <form on:submit|preventDefault={handleSubmit} class="bg-white shadow rounded p-6 max-w-xl mx-auto mt-12">
    <h1 class="text-2xl font-bold mb-4">Upload Student Submission</h1>
    <div class="mb-4">
      <label class="block font-semibold mb-1" for="taskDescription">Task/Assignment Description <span class="text-red-500">*</span></label>
      <textarea id="taskDescription" rows="3" class="w-full border p-2 rounded" bind:value={taskDescription} required placeholder="Describe the assignment, question, or task the student was responding to..."></textarea>
    </div>
    <div class="mb-4">
      <label class="block font-semibold mb-1" for="file">Upload a file (PDF, DOCX, TXT):</label>
      <input
        id="file"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        class="block w-full border p-2 rounded"
        on:change={handleFileChange}
        disabled={submitting}
      />
      <span class="text-gray-500 text-sm">Or paste the student's submission below.</span>
    </div>
    <div class="mb-4">
      <label class="block font-semibold mb-1" for="textInput">Paste assignment text:</label>
      <textarea
        id="textInput"
        rows="5"
        class="w-full border p-2 rounded"
        bind:value={textInput}
        on:input={handleTextChange}
        disabled={submitting}
        placeholder="Paste or type student answer here..."
      ></textarea>
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4" disabled={submitting || (!file && textInput.trim().length === 0)}>
      {submitting ? 'Uploading...' : 'Submit'}
    </button>
    {#if errorMsg}
      <div class="mt-4 text-red-600">{errorMsg}</div>
    {/if}
    {#if successMsg}
      <div class="mt-4 text-green-600">{successMsg}</div>
    {/if}
  </form>
</section>
