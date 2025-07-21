<script>
	import Page from "./Page.svelte";

	import { connect as mqttConnect, disconnect as mqttDisconnect } from "../lib/mqtt";
	import { makeToast, mqttConfig, mqttStatus } from "../lib/stores";

	import { connectors } from "../lib/connections";
	import { M7CLConnection } from "../lib/connections/m7cl";
	import { newConnection } from "../lib/connectionUtil";
	import {
		appConfig,
		connectionMode,
		ConnectionStatusEnum,
		currentConnection,
		currentConnectionStatus,
		m7clConfig,
		msConfig,
		wingConfig,
		x32Config,
	} from "../lib/stores";
</script>

<Page id="settings">
	<h1>Settings</h1>
	<details>
		<summary>Mixer Connection</summary>
		<div class="verti">
			<p>
				MIQ requires a proxy to connect to a mixer. <a
					href="https://mixingstation.app/"
					target="_blank"
					class="openNewIcon">Mixing Station</a
				> is supported for several popular mixers but is paid, stanalone, and only newer versions are supported. Limited
				other consoles have dedicated, free connectors.
			</p>

			<p>
				Connection mode: <select disabled={$currentConnectionStatus.status > 0} bind:value={$connectionMode}>
					{#each Object.entries(connectors) as [key, connector]}
						<option value={key}>{connector.fullName}</option>
					{/each}
				</select>
				{#if $currentConnectionStatus.status > 0}(disconnect to edit){/if}
			</p>

			{#if $connectionMode === "ms"}
				<p>Supports all consoles supported by Mixing Station, some are paid and will require a license.</p>
				<p>
					On the start-up screen of <a href="https://mixingstation.app/" target="_blank">Mixing Station</a>, click the
					settings cog in the upper right corner, then enable the REST API:
					<strong>Global Settings &rarr; API: HTTP REST &rarr; Enable.</strong>
				</p>
				<p>
					Once you have enabled the API, <strong>first</strong> connect to your mixer through Mixing Station.
					<strong>Then,</strong> leaving the settings below blank, tap connect.
				</p>
				<fieldset class="verti" disabled={$currentConnectionStatus.status > 0 || null}>
					<p>Host: <input type="text" placeholder="localhost" bind:value={$msConfig.host} /></p>
					<p>Port: <input type="number" placeholder="8080" bind:value={$msConfig.port} /></p>
					<p>Secure: <input type="checkbox" bind:checked={$msConfig.secure} /></p>
					<p>Resend cues (0≤n≤4): <input type="number" bind:value={$msConfig.resendNum} min="0" max="4" /> times</p>
					<p>Enable Auto Reconnect?: <input type="checkbox" bind:checked={$msConfig.autoReconnect} /></p>
				</fieldset>
			{:else if $connectionMode === "x32"}
				<p>Supports Behringer/Midas X32/M32 only.</p>
				<p>
					Install NodeJS and <a href="https://www.npmjs.com/package/x32-proxy" target="_blank">x32-proxy</a>, use the
					following command to start up the proxy server: <br />
					<code>x32-proxy --ws --target your.mixer.ip.address</code> <br />
					then, leaving the settings below blank, tap connect.
				</p>
				<fieldset class="verti" disabled={$currentConnectionStatus.status > 0 || null}>
					<p>Host: <input type="text" placeholder="localhost" bind:value={$x32Config.host} /></p>
					<p>Port: <input type="number" placeholder="8080" bind:value={$x32Config.port} /></p>
					<p>Secure: <input type="checkbox" bind:checked={$x32Config.secure} /></p>
					<p>Resend cues (0≤n≤4): <input type="number" bind:value={$x32Config.resendNum} min="0" max="4" /> times</p>
					<p>Enable Live Metering?: <input type="checkbox" bind:checked={$x32Config.liveMetersEnabled} /></p>
					<p>Enable Auto Reconnect?: <input type="checkbox" bind:checked={$x32Config.autoReconnect} /></p>
				</fieldset>
			{:else if $connectionMode === "wing"}
				<p>Supports Behringer Wing only.</p>
				<p>
					Run <code>node connectors/wing-proxy.js &lt;ip&gt;</code>. <br />
					All controlled channels must have "Link Customization to Source" disabled to see name/color.
				</p>
				<fieldset class="verti" disabled={$currentConnectionStatus.status > 0 || null}>
					<p>Host: <input type="text" placeholder="localhost" bind:value={$wingConfig.host} /></p>
					<p>Port: <input type="number" placeholder="8080" bind:value={$wingConfig.port} /></p>
					<p>Resend cues (0≤n≤4): <input type="number" bind:value={$wingConfig.resendNum} min="0" max="4" /> times</p>
					<!-- <p>Enable Live Metering?: <input type="checkbox" bind:checked={$x3wingConfig2Config.liveMetersEnabled} /></p> -->
					<p>Enable Auto Reconnect?: <input type="checkbox" bind:checked={$wingConfig.autoReconnect} /></p>
				</fieldset>
			{:else if $connectionMode == "m7cl"}
				<p>
					Supports Yamaha M7CL only. (support for similar Yamaha consoles may be simple to add changing the console ID)
				</p>
				<p>
					Connect to the M7CL over MIDI, and configure it to receive NRPN control change and parameter change commands.
				</p>
				<fieldset class="verti" disabled={$currentConnectionStatus.status > 0 || null}>
					<p>Default Output ID: <input type="text" bind:value={$m7clConfig.host} /></p>
					<p>Default Input ID: <input type="text" bind:value={$m7clConfig.inputHost} /></p>
					<p>Enable Live Metering?: <input type="checkbox" bind:checked={$m7clConfig.liveMetersEnabled} /></p>
					<p>
						Metering Point: <select bind:value={$m7clConfig.liveMeterPoint}>
							{#each Object.entries(M7CLConnection.MeterPointEnum) as [key, value]}
								<option {value} selected={value === $m7clConfig.liveMeterPoint}>{key.replaceAll("_", " ")}</option>
							{/each}
						</select>
					</p>
				</fieldset>
			{/if}
			<p>
				{#if $currentConnectionStatus.status === ConnectionStatusEnum.CONNECTED}
					<button class="green" onclick={() => $currentConnection?.close()}>Connected (tap to disconnect)</button>
				{:else if $currentConnectionStatus.status === ConnectionStatusEnum.CONNECTING}
					<button class="yellow" onclick={() => $currentConnection?.close()}>Connecting (tap to stop)</button>
				{:else}
					<button class="red" onclick={newConnection}>Disconnected (tap to connect)</button>
				{/if}
			</p>
		</div>
	</details>
	<details>
		<summary>MQTT</summary>
		<div class="verti" style="align-items: flex-start">
			<fieldset class="verti" disabled={$mqttStatus.status > 0 || null}>
				<p>Host: <input type="text" bind:value={$mqttConfig.host} /></p>
				<p>Port: <input type="number" placeholder="443" bind:value={$mqttConfig.port} /></p>
				<p>Basepath: <input type="text" placeholder="/ws" bind:value={$mqttConfig.basepath} /></p>
				<p>Use Authentication? <input type="checkbox" bind:checked={$mqttConfig.useAuth} /></p>
				{#if $mqttConfig.useAuth}
					<p>Username: <input type="text" bind:value={$mqttConfig.username} /></p>
					<p>Password: <input type="password" bind:value={$mqttConfig.password} /></p>
				{/if}
				<p>Topic: <input type="text" bind:value={$mqttConfig.topic} /></p>
				<p>
					Mode: <select bind:value={$mqttConfig.mode}>
						<option value="tx">Transmit</option>
						<option value="rx">Receive</option>
					</select>
				</p>
				{#if $mqttConfig.mode === "rx"}
					<p>
						Follow:
						<input type="checkbox" bind:checked={$mqttConfig.rx_preview} /> Preview
						<input type="checkbox" bind:checked={$mqttConfig.rx_live} /> Live
					</p>
				{/if}
			</fieldset>
			<p>
				{#if $mqttStatus.status === ConnectionStatusEnum.CONNECTED}
					<button class="green" onclick={mqttDisconnect}>Connected (tap to disconnect)</button>
				{:else if $mqttStatus.status === ConnectionStatusEnum.CONNECTING}
					<button class="yellow" disabled>Connecting</button>
				{:else}
					<button class="red" onclick={mqttConnect}>Disconnected (tap to connect)</button>
				{/if}
			</p>
		</div>
	</details>
	<details>
		<summary>App</summary>
		<p>
			Flip Scene Order: <input type="checkbox" bind:checked={$appConfig.flipSceneOrder} />
			({$appConfig?.flipSceneOrder ? "live" : "preview"} first)
		</p>
		<hr />
		<p>built {BUILD_TIME}</p>
		<p>
			<button
				onclick={async () => {
					const reg = await navigator.serviceWorker.getRegistration();
					if (!reg) {
						makeToast("No service worker registered", "", "warn");
						return;
					}
					reg
						.update()
						.then(() => {
							makeToast("Service worker updated", "", "info");
						})
						.catch((err) => {
							makeToast("Error updating service worker", err.message, "error");
						});
					navigator.serviceWorker.addEventListener("controllerchange", () => {
						makeToast("New service worker taking control", "", "info");
						location.reload();
					});
				}}>Force update</button
			>
			<button
				onclick={() => {
					location.reload();
				}}>Force refresh</button
			>
		</p>
	</details>
</Page>

<style lang="scss">
	div[disabled] {
		opacity: 0.5;
		* {
			pointer-events: none;
			user-select: none;
		}
	}
	details[open] summary {
		font-weight: bold;
	}
	details {
		width: 100%;
	}
</style>
