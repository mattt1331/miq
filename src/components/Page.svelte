<script lang="ts">
	import type { Snippet } from "svelte";
	import { showingPage } from "../lib/stores";
	import type { PageId } from "../lib/types";

	const closePage = () => ($showingPage = null);
	let {
		id,
		children,
	}: {
		id: PageId;
		children?: Snippet<[{ closePage: typeof closePage }]>;
	} = $props();
</script>

<div class="page" class:showing={$showingPage === id}>
	<button class="closePageButton" onclick={closePage}>esc</button>
	{@render children?.({ closePage })}
</div>

<style lang="scss">
	.page {
		// background-color: var(--bg);
		opacity: 0;
		position: absolute;
		transform: scale(1.2);
		transition: var(--page-transition);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		max-width: min(860px, 100%);
		min-height: min(100%, 400px);
		width: 100%;
		max-height: 100%;
		overflow: auto;
		padding: 12px;
		box-sizing: border-box;
		gap: var(--spacing);
		pointer-events: none;
		&.showing {
			opacity: 1;
			transform: scale(1);
			pointer-events: auto;
		}
	}
	.closePageButton {
		background: var(--bg);
		box-shadow: 0 0 5px 0 var(--bg);
		aspect-ratio: 1;
		padding: 0.75em;
		flex-shrink: 0;
		position: sticky;
		top: 0;
	}
</style>
