<script>
	import { run } from 'svelte/legacy';

	import Modal from "./modal.svelte";
	import { db, storedConfigs, configs, sheets, updateSheet } from "../lib/db";
	import Papa from "papaparse";
	import { ddp } from "../lib/db";
	import { selectedConfigId } from "../lib/stores";

	import "boxicons";

	/** @type {"configs"|"sheets"} */
	let mode = $state("configs");
	let editing = $state({});

	async function addNew() {
		const newOne = await db[mode].add({ name: "" });
		console.log(newOne);
		editing = { mode, data: { id: newOne, ...ddp } };
	}

	async function update(toUpdate) {
		if (toUpdate.mode && toUpdate.data) {
			await db[toUpdate.mode].update({ id: toUpdate.data.id }, toUpdate.data);
		}
	}

	async function deleteCurrent() {
		if (editing?.data?.id) {
			await db[editing.mode].delete(editing.data.id);
			// editing = { mode, data: { configs: $storedConfigs, sheets: $sheets }[mode][1] } || {};
			editing = {};
		}
	}

	run(() => {
		update(editing);
	});
	// $: editing = {
	// 	mode,
	// 	data: { configs: $configs, sheets: $sheets }[mode]?.find(
	// 		(item) => item.id === editing.data?.id
	// 	),
	// };

	run(() => {
		console.log(editing);
	});

	run(() => {
		if (editing.mode != mode) editing = {};
	});

	let exportedLink = $state("");
	run(() => {
		if (editing?.data && editing.mode === "configs") {
			// export config as link with base64 encoded json containing google sheet Id
			try {
				let config = $storedConfigs.find((item) => item.id === editing.data.id);
				const sheetId = $sheets.find((item) => item.id === config?.sheetId)?.sheetId;
				config = { ...config, sheetId };
				delete config.id;
				const link = new URL(window.location.href);
				link.searchParams.set("config", btoa(JSON.stringify(config)));
				exportedLink = link.href;
			} catch (error) {
				console.error(error);
			}
		}
	});

	async function importLinkedConfig() {
		const linkedConfig = $configs.find((item) => item.id === "linked");
		if (!linkedConfig) {
			return;
		}
		const sheetId = linkedConfig?.sheetId;
		delete linkedConfig.sheetId;
		delete linkedConfig.id;
		if (linkedConfig.table) delete linkedConfig.table;
		linkedConfig.name = linkedConfig.name.replace(/^Linked: /, "");
		// add sheet to sheets
		const sheet = { sheetId, name: linkedConfig.name };
		const newSheetId = await db.sheets.add(sheet);
		// add config to configs
		await db.configs.add({ ...linkedConfig, sheetId: newSheetId });
		await new Promise((resolve) => {
			Papa.parse(`https://docs.google.com/spreadsheets/d/${sheet.sheetId}/export?format=csv`, {
				download: true,
				header: false,
				complete: async function (results) {
					console.log(results);
					let data = results.data;
					db.sheets.update({ id: newSheetId }, { table: data, lastFetched: new Date() });
					resolve();
				},
			});
		});
	}
</script>

<Modal modalName="dbConfig" >
	{#snippet children({ closeModal })}
		<h1>Database Manager</h1>
		<div>
			<div class="tabber" role="tablist">
				<button role="tab" aria-selected={mode === "configs"} onclick={() => (mode = "configs")}>Configurations</button>
				<button role="tab" aria-selected={mode === "sheets"} onclick={() => (mode = "sheets")}>Downloaded Sheets</button>
			</div>
			<button onclick={addNew}>Add New</button>
			{#if $configs.find((item) => item.id === "linked")}
				<button onclick={importLinkedConfig}>Import Linked Config</button>
			{/if}
		</div>
		<div class="horiz" style="width: 100%; height: 600px">
			<div
				class="verti itemList"
				onkeydown={(e) => {
					if (e.key === "Delete") deleteCurrent();
				}}
				role="listbox"
				tabindex="0"
			>
				{#each { configs: $storedConfigs, sheets: $sheets }[mode] || [] as item, i}
					<button
						class="item"
						class:untitled={item.name === ""}
						class:selected={editing?.data?.id === item.id}
						onclick={() => (editing = { mode, data: item })}
						ondblclick={() => {
							if (editing?.mode === "configs") {
								$selectedConfigId = item.id;
								closeModal();
							}
						}}
					>
						{item.name || "Untitled"}
					</button>
				{/each}
			</div>
			<div class="itemConfig verti">
				{#if typeof editing?.data?.id === "number"}
					<p>
						Name: <input type="text" bind:value={editing.data.name} />
						{#if editing?.mode === "configs"}
							<button
								class="white"
								onclick={() => {
									$selectedConfigId = editing.data.id;
									closeModal();
								}}>Open Config</button
							>
						{/if}
					</p>
					{#if editing?.mode === "sheets"}
						<p>
							Google Sheets ID: <input type="text" placeholder="44 characters" bind:value={editing.data.sheetId} />
						</p>
						<p>
							Last fetched: {editing.data.lastFetched || "Never"}
							<button
								onclick={async () => {
									let record = await updateSheet(editing.data.id);
									editing = { ...editing, data: record };
								}}>Fetch Now</button
							>
						</p>
						{#if editing.data.table}
							<div style="width: 100%; display: flex; overflow: auto;">
								<table style="flex:1; width: 100%; overflow: auto;">
									{#each editing.data.table as row}
										<tr>
											{#each row as cell}
												<td>{cell}</td>
											{/each}
										</tr>
									{/each}
								</table>
							</div>
						{/if}
					{:else if editing?.mode === "configs"}
						<p>
							Google Sheet:
							<select bind:value={editing.data.sheetId}>
								{#each $sheets as sheet}
									<option value={sheet.id} class:untitled={sheet.name === ""}>{sheet.name || "Untitled"}</option>
								{/each}
							</select>
						</p>
						<p>
							Notes Row: <input type="number" bind:value={editing.data.notesRow} />
						</p>
						<p>
							Scene Names Row: <input type="number" bind:value={editing.data.namesRow} />
						</p>
						<p>
							Flags Row: <input type="number" bind:value={editing.data.flagsRow} />
						</p>
						<p>
							Mics Start Row: <input type="number" bind:value={editing.data.micsStartRow} />
						</p>
						<p>
							Actor Names Column: <input type="number" bind:value={editing.data.actorNamesCol} />
						</p>
						<p>
							Mic Numbers Column: <input type="number" bind:value={editing.data.micNumsCol} />
						</p>
						<p>
							Scenes Start Column: <input type="number" bind:value={editing.data.scenesStartCol} />
						</p>
						<p>
							<details>
								<summary>Export as link</summary>
								<a href={exportedLink} style="word-wrap: break-word;">{exportedLink}</a>
							</details>
						</p>
					{/if}
					<p style="margin-top: 24px;">
						<button class="red" onclick={deleteCurrent}>Delete Entry</button>
					</p>
				{/if}
			</div>
		</div>
	{/snippet}
</Modal>

<style lang="scss">
	.itemList {
		width: 200px;
		height: 100%;
		overflow-y: auto;
		gap: 0;
		> button {
			padding: 4px;
			padding-block: 8px;
			border-radius: 0;
			border: none;
			text-align: left;
			&.selected {
				background-color: var(--accent);
				color: var(--accent-text);
			}
			&.untitled {
				color: #fff6;
				color: var(--text-dimmed);
				font-style: italic;
			}
		}
		border: 2px solid var(--fg);
		border-radius: calc(var(--rounding) * 1 / 3);
	}
	.itemConfig {
		// width: 500px;
		flex: 1;
		height: 100%;
		width: 100%;
		overflow-y: auto;
		gap: 8px;
	}
	td {
		white-space: nowrap;
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
