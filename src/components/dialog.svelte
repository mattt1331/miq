<script>
	import { run, self } from 'svelte/legacy';

	import { createEventDispatcher, onMount } from "svelte";
	const dispatch = createEventDispatcher();

	/** @type {{show?: boolean, confirmation?: boolean, children?: import('svelte').Snippet, buttons?: import('svelte').Snippet}} */
	let {
		show = $bindable(false),
		confirmation = false,
		children,
		buttons
	} = $props();

	/** @type {HTMLDialogElement} */
	let dialog = $state();

	run(() => {
		if (dialog) {
			if (show) dialog.showModal();
			else dialog.close();
		}
	});

	onMount(async () => {
		// polyfill for some slightly older safari versions that we still kinda need to support
		if (!window.HTMLDialogElement) {
			try {
				await tick(); // wait for dialog to be in DOM
				const dialogPolyfill = (await import("dialog-polyfill")).default;
				console.log(dialog);
				dialogPolyfill.registerDialog(dialog);
				await import("dialog-polyfill/dist/dialog-polyfill.css");
			} catch (e) {
				console.error("dialog polyfill error", e);
			}
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => {
		if (dialog.returnValue === "confirm")
			dispatch("confirm"); // when explicitly confirming
		else dispatch("cancel"); // for any other reason (click out, etc.)
		show = false;
		dispatch("close", dialog.returnValue); // always (for resetting content or handling a custom return), DONE LAST
		dialog.returnValue = "";
	}}
	onclick={self(() => dialog.close())}
>
	<form method="dialog">
		{@render children?.()}
		<div class="horizPanel">
			<!-- svelte-ignore a11y_autofocus -->
			<button autofocus type="submit" formnovalidate>{confirmation ? "Cancel" : "Close"}</button>
			{#if confirmation}<button type="submit" value="confirm">Confirm</button>{/if}
			{@render buttons?.()}
		</div>
	</form>
</dialog>

<style lang="scss">
	dialog[open] {
		border: none;
		padding: 0;
		margin: revert;

		border-radius: 0.25em;
		font-size: 17px;
	}
	form {
		width: clamp(260px, 50vw, 40rem);
		min-height: 15vh;
		box-sizing: border-box;
		/* so clicking on the edges won't count as clicking outside */
		padding: 12px;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75em;

		& > :global(*) {
			margin: 0;
			width: 100%;
			text-align: center;
		}

		& > :global(div) {
			display: flex;
			gap: 0.25em;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
		}
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fade 250ms ease;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
