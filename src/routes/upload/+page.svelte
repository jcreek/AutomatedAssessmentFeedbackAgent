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

  errorMsg = '';
  try {
    const response = await fetch('/api/grade', {
      method: 'POST',
      body: formData
    });
    let result;
    try {
      result = await response.json();
    } catch {
      errorMsg = 'Received an invalid response from the server.';
      submitting = false;
      return;
    }
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
      if (result && result.error) {
        errorMsg = `Sorry, something went wrong: ${result.error}`;
      } else if (response.status === 413) {
        errorMsg = 'The uploaded file is too large. Please upload a smaller file.';
      } else if (response.status >= 500) {
        errorMsg = 'The server encountered an error. Please try again later.';
      } else {
        errorMsg = 'An unknown error occurred. Please check your input and try again.';
      }
    }
  } catch (err) {
    errorMsg = 'Network or server error. Please check your connection and try again.';
  } finally {
    submitting = false;
  }
}

</script>

<section class="max-w-xl mx-auto py-12 relative">
  <h1 class="text-2xl font-bold mb-4">Upload Student Submissions</h1>
  <p class="mb-6">Upload student assignments for instant AI-powered assessment and feedback.</p>
  {#if errorMsg}
    <div class="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded" aria-live="assertive" role="alert">
      <strong>Error:</strong> {errorMsg}
    </div>
  {/if}
  {#if submitting}
    <div class="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-20" role="status" aria-busy="true" aria-live="polite" tabindex="-1">
      <svg class="animate-spin h-10 w-10 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span class="sr-only">Loading...</span>
      <span class="text-blue-700 font-semibold">Grading in progress...</span>
    </div>
  {/if}
  <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label class="block mb-1 font-semibold" for="task">Task/Assignment Description <span class="text-red-500">*</span></label>
      <textarea id="task" class="w-full border rounded p-2" rows="2" bind:value={taskDescription} required aria-required="true" aria-label="Task or Assignment Description" disabled={submitting}></textarea>
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
