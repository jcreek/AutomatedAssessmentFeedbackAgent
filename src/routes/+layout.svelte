<script lang="ts">
	import '../app.css';
	import '$lib/components/Navbar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<Navbar />

{@render children()}
