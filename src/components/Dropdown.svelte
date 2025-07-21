<script lang="ts">
	import type { Snippet } from "svelte";
	let { items, children }: { items: [string, () => void][]; children: Snippet } = $props();

	let dropdown: HTMLDetailsElement;
</script>

<svelte:document
	onclick={(e) => {
		let click = e.target as HTMLElement;
		if (
			dropdown.open &&
			!dropdown.contains(click)
			// || (click instanceof HTMLButtonElement && !click.disabled)
			// || click instanceof HTMLAnchorElement
		) {
			dropdown.open = false;
		}
	}}
/>

<details class="dropdown" bind:this={dropdown}>
	<summary>
		{@render children()}
	</summary>

	<ul role="menu">
		{#each items as [name, action]}
			<li role="menuitem">
				<button onclick={action}>{name}</button>
			</li>
		{:else}
			<li role="menuitem" class="disabled">
				<button disabled>No items available</button>
			</li>
		{/each}
	</ul>
</details>

<style lang="scss">
	details {
		border: none;
		overflow: visible;

		position: relative;
		padding: 0;
	}

	summary {
		list-style: none;
		margin: 0 !important;
		box-sizing: border-box;

		::marker,
		::-webkit-details-marker {
			display: none;
		}
	}

	:global(.miniMode) li:not(:first-child) {
		margin-top: 4px;
	}

	ul {
		position: absolute;
		z-index: 100;
		left: 0;
		margin-top: calc(var(--spacing) / 3);
		min-width: 100px;
		overflow: hidden;
		list-style: none;
		padding: calc(var(--spacing) / 2);

		background-color: var(--bg);
		border: 2px solid var(--fg);
		border-radius: var(--rounding);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

		a,
		button {
			display: block;
			width: 100%;
			box-sizing: border-box;
			padding: calc(var(--spacing) * 0.8);
			border-radius: calc(var(--rounding) - var(--spacing) / 2);

			color: var(--text);
			font-family: inherit;
			font-size: 0.9em;
			text-align: left;

			text-decoration: none;
			background: none;
			border: none;

			cursor: pointer;
			transition: background-color 120ms ease-in-out;

			&:hover {
				background-color: var(--fg);
				color: var(--text);
			}
		}
	}
</style>
