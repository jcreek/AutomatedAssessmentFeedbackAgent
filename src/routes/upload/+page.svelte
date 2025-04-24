<script lang="ts">
	import AgenticProgress from '$lib/components/AgenticProgress.svelte';

	let file: File | null = null;
	let textInput = '';
	let taskDescription = '';
	let submitting = false;
	let successMsg = '';
	let errorMsg = '';
	let toolEvents: Array<{ tool: string; time: string }> = [];
	let roomId: string = '';
	let ws: WebSocket | null = null;
	const PARTYKIT_BASE_URL = import.meta.env.VITE_PARTYKIT_BASE_URL;

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
		const THINKING_EVENT = { tool: 'thinking', time: new Date().toISOString() };
		function ensureThinkingStep(events) {
			// Remove any existing 'thinking' event
			const filtered = events.filter(e => e.tool !== 'thinking');
			return [THINKING_EVENT, ...filtered];
		}
		toolEvents = [THINKING_EVENT];

		// Generate a unique roomId for this submission
		roomId = crypto.randomUUID();
		// Connect to PartyKit for this session
		if (ws) ws.close();
		ws = new WebSocket(`${PARTYKIT_BASE_URL}/party/tool-usage-server-${roomId}`);
		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				toolEvents = ensureThinkingStep([...toolEvents, data]);
			} catch {}
		};

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
		formData.append('roomId', roomId);

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
						task: taskDescription
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
      // Disabled to make the transition to the results page smoother
			// submitting = false;
		}
	}
</script>

<section class="relative mx-auto max-w-4xl py-12">
	{#if errorMsg}
		<div
			class="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700"
			aria-live="assertive"
			role="alert"
		>
			<strong>Error:</strong>
			{errorMsg}
		</div>
	{/if}
	{#if submitting}
		<AgenticProgress {toolEvents} />
	{:else}
		<h1 class="mb-4 text-2xl font-bold">Upload Student Submissions</h1>
		<p class="mb-6">Upload student assignments for instant AI-powered assessment and feedback.</p>
		<form class="space-y-6" on:submit|preventDefault={handleSubmit}>

			<div class="mb-4">
				<label class="mb-1 block font-semibold" for="task"
					>Task/Assignment Description <span class="text-red-500">*</span></label
				>
				<textarea
					id="task"
					class="w-full rounded border p-2"
					rows="2"
					bind:value={taskDescription}
					required
					aria-required="true"
					aria-label="Task or Assignment Description"
					disabled={submitting}
					data-testid="task-input"
				></textarea>
			</div>
			<div class="mb-4">
				<label class="mb-1 block font-semibold" for="file">Upload a file (PDF, DOCX, TXT):</label>
				<input
					id="file"
					type="file"
					accept=".pdf,.doc,.docx,.txt"
					class="block w-full rounded border p-2"
					on:change={handleFileChange}
					disabled={submitting}
				/>
				<span class="text-sm text-gray-500">Or paste the student's submission below.</span>
			</div>
			<div class="mb-4">
				<label class="mb-1 block font-semibold" for="textInput">Paste assignment text:</label>
				<textarea
					id="textInput"
					rows="5"
					class="w-full rounded border p-2"
					bind:value={textInput}
					on:input={handleTextChange}
					disabled={submitting}
					placeholder="Paste or type student answer here..."
					data-testid="submission-input"
				></textarea>
			</div>
			<button
				type="submit"
				class="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				disabled={submitting || (!file && textInput.trim().length === 0)}
				data-testid="submit-button"
			>
				{submitting ? 'Uploading...' : 'Submit'}
			</button>
			{#if errorMsg}
				<div class="mt-4 text-red-600">{errorMsg}</div>
			{/if}
			{#if successMsg}
				<div class="mt-4 text-green-600">{successMsg}</div>
			{/if}
		</form>
	{/if}
</section>
