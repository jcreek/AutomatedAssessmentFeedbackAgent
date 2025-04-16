<script lang="ts">
import { onMount } from 'svelte';

let file: File | null = null;
let textInput = '';
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

  const formData = new FormData();
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
      // Redirect to /results with feedback in history state
      window.history.pushState({ feedback: result }, '', '/results');
      window.location.assign('/results');
      file = null;
      textInput = '';
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
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div>
      <label for="file" class="block font-semibold mb-1">Upload a file (PDF, DOCX, TXT):</label>
      <input
        id="file"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        class="block w-full border rounded p-2"
        on:change={handleFileChange}
        disabled={submitting}
      />
    </div>
    <div class="text-center text-gray-500">or</div>
    <div>
      <label for="textInput" class="block font-semibold mb-1">Paste assignment text:</label>
      <textarea
        id="textInput"
        rows="6"
        class="block w-full border rounded p-2"
        bind:value={textInput}
        on:input={handleTextChange}
        disabled={submitting}
        placeholder="Paste or type student answer here..."
      ></textarea>
    </div>
    {#if errorMsg}
      <div class="text-red-600 font-medium">{errorMsg}</div>
    {/if}
    {#if successMsg}
      <div class="text-green-600 font-medium">{successMsg}</div>
    {/if}
    <button
      class="btn btn-primary mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
      type="submit"
      disabled={submitting || (!file && textInput.trim().length === 0)}
    >
      {submitting ? 'Uploading...' : 'Upload'}
    </button>
  </form>
</section>
