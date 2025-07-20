<script lang="ts">
	import { currentConnection } from "../lib/stores";
	import Page from "./Page.svelte";

	let outputs: Record<string, any> = {};
</script>

<Page id="tools">
	<h1>Tools</h1>

	{#each Object.entries($currentConnection?.tools || {}) as [name, fn]}
		<button
			onclick={async () => {
				outputs[name] = await fn();
			}}>{name}</button
		>
		{outputs?.[name]}
	{:else}
		<p>No tools available</p>
	{/each}
</Page>
