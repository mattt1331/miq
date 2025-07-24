<script lang="ts">
	import "boxicons";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { toasts } from "../lib/stores";
	import type { Toast } from "../lib/types";

	let { toastMessage, timeout = 8000 }: { toastMessage: Toast; timeout?: number } = $props();

	const { title, message, type, id } = toastMessage;

	const style = {
		info: { icon: "info-circle", color: "currentColor" },
		warn: { icon: "error", color: "var(--yellow)" },
		error: { icon: "error-circle", color: "var(--red)" },
	}[type || "info"];

	const close = () => toasts.update((t) => t.filter((t) => t.id !== id));

	onMount(() => {
		setTimeout(close, timeout);
	});
</script>

{#if $toasts.some((t) => t.id === id)}
	<div
		role="alert"
		class="horiz toast"
		in:fly={{ y: -100, opacity: 1, duration: 240 }}
		out:fly={{ y: -100, opacity: 0, duration: 240 }}
	>
		<box-icon style="flex-shrink: 0" name={style?.icon || "question-mark"} color={style?.color || "currentColor"}
		></box-icon>
		<p>
			<strong title={title || null}>{title || "Message"}</strong><br />
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				title={message}
				onclick={({ currentTarget }) => {
					const range = document.createRange();
					range.selectNodeContents(currentTarget);
					const selection = window.getSelection();
					selection?.removeAllRanges();
					selection?.addRange(range);
				}}>{message}</span
			>
		</p>
		<box-icon
			name="x"
			color="currentColor"
			role="button"
			tabindex="0"
			style="cursor: pointer; margin-left: auto;"
			onclick={close}
			onkeydown={close}
		></box-icon>
	</div>
{/if}

<style lang="scss">
	.toast {
		background: #222;
		margin: var(--spacing);
		height: var(--top-height);
		padding: var(--spacing);
		box-sizing: border-box;
		border-radius: var(--rounding);
		font-size: 0.7em;
		max-width: 400px;
		box-shadow: 0 0 5px 0 var(--bg);

		p {
			max-height: 100%;
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;

			strong {
				white-space: nowrap;
			}
			span {
				white-space: pre-wrap;
			}
		}
	}

	// to easily print out the tool reports when selected
	@media print {
		* {
			background: none;
			color: black;
		}
	}
</style>
