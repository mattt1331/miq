<script lang="ts">
	import { onMount, tick, type Snippet } from "svelte";
	import { showingDialog } from "../lib/stores";

	let {
		show = $bindable(false),
		confirmation = false,
		children,
		buttons,
		onconfirm,
		oncancel,
		onclose,
	}: {
		show?: boolean;
		/** false only shows the close button */
		confirmation?: boolean;

		children?: Snippet;
		buttons?: Snippet;

		onconfirm?: (prevent: () => void) => void;
		oncancel?: (prevent: () => void) => void;
		onclose?: (returnValue: string) => void;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (dialog) {
			if (show) dialog.showModal();
			else dialog.close();
			$showingDialog = show;
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
		let prevented = false;
		const prevent = () => {
			dialog.showModal();
			prevented = true;
		};

		if (dialog.returnValue === "confirm")
			onconfirm?.(prevent); // when explicitly confirming
		else oncancel?.(prevent); // for any other reason (click out, etc.)
		if (!prevented) {
			show = false;
			onclose?.(dialog.returnValue); // always (for resetting content or handling a custom return), DONE LAST
		}
		dialog.returnValue = "";
	}}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
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

	// native
	dialog::backdrop,
	// pollyfill
	dialog :global(+ .backdrop) {
		background-color: rgba(0, 0, 0, 0.5);
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
