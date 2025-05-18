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
	let hitl = false; // Human-in-the-Loop toggle
	let ws: WebSocket | null = null;
	const PARTYKIT_BASE_URL = import.meta.env.VITE_PARTYKIT_BASE_URL;

	// HITL state
	let humanReviewRequired = false;
	let aiReasoning = '';
	let humanReviewText = '';
	let hitlContext: any = null;

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

	// Poll for completion of the grading operation
	interface PollResult {
		completed: boolean;
		result?: any;
	}

	interface ToolEvent {
		tool: string;
		time: string;
		// Add other properties as needed
	}

	async function pollForCompletion(threadId: string, runId: string, maxAttempts = 60, interval = 2000): Promise<PollResult> {
		let attempts = 0;
		
		const checkStatus = async (): Promise<PollResult> => {
			try {
				const response = await fetch(`/api/grade/status/${threadId}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				const result = await response.json() as PollResult;
				
				if (result.completed) {
					// If we have a result, return it
					if (result.result) {
						return result;
					}
					// If no result but completed, throw an error
					throw new Error('Operation completed but no result was returned');
				}
				
				// If not completed and we have attempts left, poll again
				if (attempts < maxAttempts) {
					attempts++;
					await new Promise(resolve => setTimeout(resolve, interval));
					return checkStatus();
				}
				
				// Max attempts reached
				throw new Error('Operation timed out');
			} catch (error) {
				console.error('Error polling status:', error);
				throw error;
			}
		};
		
		return checkStatus();
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		successMsg = '';
		errorMsg = '';
		const THINKING_EVENT = { tool: 'thinking', time: new Date().toISOString() };
		
		function ensureThinkingStep(events: ToolEvent[]): ToolEvent[] {
			// Remove any existing 'thinking' event
			const filtered = events.filter((e: ToolEvent) => e.tool !== 'thinking');
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
		formData.append('hitl', hitl ? 'true' : 'false');

		errorMsg = '';
		try {
			// Start the grading operation
			const response = await fetch('/api/grade', {
				method: 'POST',
				body: formData
			});

			let result;
			try {
				result = await response.json();
			} catch (err) {
				console.error('Error parsing /api/grade response:', err);
				errorMsg = 'Received an invalid response from the server.';
				submitting = false;
				return;
			}

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to start grading operation');
			}

			// Start polling for completion
			try {
				const pollResult = await pollForCompletion(result.threadId, result.runId);
				
				if (pollResult.result) {
					// Handle the result
					const finalResult = pollResult.result;
					
					if (finalResult.grade === 'HUMAN_REVIEW_REQUIRED') {
						humanReviewRequired = true;
						aiReasoning = finalResult.reasoning;
						hitlContext = finalResult.hitlContext || { 
							threadId: result.threadId, 
							runId: result.runId 
						};
						submitting = false;
						return;
					}

					// Save to localStorage history
					try {
						let prev = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
						const entry = {
							timestamp: Date.now(),
							...finalResult,
							submission: finalResult.submission || textInput || '',
							task: taskDescription
						};
						prev.unshift(entry);
						localStorage.setItem('assessmentHistory', JSON.stringify(prev.slice(0, 50)));
					} catch (e) {
						console.error('Error saving to history:', e);
					}

					// Redirect to results page
					window.location.assign('/results');

					// Reset form
					file = null;
					textInput = '';
					taskDescription = '';
				}
			} catch (pollError: unknown) {
				console.error('Error during polling:', pollError);
				const errorMessage = pollError instanceof Error ? pollError.message : 'An unknown error occurred during polling';
				errorMsg = `Error during grading: ${errorMessage}`;
				submitting = false;
			}
		} catch (err: unknown) {
			console.error('Error starting grading operation:', err);
			const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
			errorMsg = `Failed to start grading: ${errorMessage}`;
			submitting = false;
		}
	}

	async function submitHumanReview() {
		submitting = true;
		errorMsg = '';
		try {
			const response = await fetch('/api/hitl-review', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					humanReview: humanReviewText,
					context: hitlContext
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				let prev = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
				const entry = {
					timestamp: Date.now(),
					...result,
					submission: result.submission || textInput || '',
					task: taskDescription
				};
				prev.unshift(entry);
				localStorage.setItem('assessmentHistory', JSON.stringify(prev.slice(0, 50)));
				window.location.assign('/results');
			} else {
				console.error('HITL review API error or non-success:', response, result);
				errorMsg = result.error || 'Unknown error during HITL review.';
			}
		} catch (err) {
			console.error('Error submitting HITL review:', err);
			errorMsg = 'Network or server error during HITL review.';
		} finally {
			submitting = false;
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

	{#if humanReviewRequired}
		<div class="mb-6 rounded border-l-4 border-yellow-400 bg-yellow-50 p-4">
			<h2 class="mb-2 font-bold text-yellow-800">Human Review Needed</h2>
			<p class="mb-3 text-gray-800">{aiReasoning}</p>
			<textarea
				bind:value={humanReviewText}
				rows="4"
				class="mb-3 w-full rounded border p-2"
				placeholder="Enter your feedback, grade, or comments..."
			></textarea>
			<button
				class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click|preventDefault={submitHumanReview}
				disabled={submitting || !humanReviewText.trim()}
			>
				Submit Review
			</button>
		</div>
	{:else if submitting}
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
				<label class="flex cursor-pointer items-center gap-3 select-none" for="hitl-toggle">
					<span class="relative inline-block h-7 w-12 align-middle select-none">
						<input
							type="checkbox"
							id="hitl-toggle"
							class="peer absolute h-0 w-0 opacity-0"
							bind:checked={hitl}
							disabled={submitting}
						/>
						<span
							class="block h-7 w-12 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600"
						></span>
						<span
							class="dot absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
						></span>
					</span>
					<span class="font-medium text-gray-900"
						>EXPERIMENTAL: Let the agent request human review if needed (Human-in-the-Loop)</span
					>
				</label>
				<div class="mt-1 ml-1 text-sm text-gray-500">
					If enabled, the AI can ask for human help on unclear or unevaluable submissions.
				</div>
			</div>
			<div class="mb-4">
				<label class="mb-1 block font-semibold" for="file">Upload a file (PDF, DOCX, TXT):</label>
				<input
					id="file"
					type="file"
					accept=".pdf,.doc,.docx,.txt"
					class="block w-full cursor-not-allowed rounded border bg-gray-100 p-2"
					on:change={handleFileChange}
					disabled
				/>
				<span class="text-sm text-red-600">File upload is disabled for this hackathon demo.</span>
			</div>
			<div class="mb-4">
				<label class="mb-1 block font-semibold" for="textInput"
					>Paste assignment text: <span class="text-red-500">*</span></label
				>
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
