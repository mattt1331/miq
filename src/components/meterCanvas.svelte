<script lang="ts">
	import type { BaseConnection } from "../lib/connections/baseConnection";
	import { channelMeters, currentConnection } from "../lib/stores";
	import { onMount } from "svelte";

	let { channel = 20 }: { channel?: number } = $props();
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = $state(null);

	let readings = Array(100).fill(0);

	let enabled = $derived(
		// fixme: should be an instance method
		($currentConnection?.constructor as typeof BaseConnection | undefined)?.getCompleteConfig?.()?.liveMetersEnabled,
	);

	$effect(() => {
		readings.shift();
		readings.push($channelMeters[channel - 1]);
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let i = 0; i < readings.length; i++) {
				let reading = readings[i];
				if (reading > 0.99) {
					ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
				} else if (reading > 0.85) {
					ctx.fillStyle = "rgba(255, 238, 0, 0.4)";
				} else {
					ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
				}
				ctx.fillRect(i, canvas.height - reading * canvas.height, 1, reading * canvas.height);
			}
		}
	});

	onMount(() => {
		ctx = canvas.getContext("2d");
		if (ctx) ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
	});
</script>

<canvas bind:this={canvas} height="100" width="100" style:display={enabled ? null : "none"}></canvas>

<style>
	canvas {
		/* background: #fff4; */
		position: absolute;
		width: 100%;
		bottom: 0;
		left: 0;
		height: 100%;
	}
</style>
