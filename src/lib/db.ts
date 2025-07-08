import Dexie from "dexie";
import { derived, writable, type Readable } from "svelte/store";
import Papa from "papaparse";
import { makeToast, selectedConfigId } from "./stores";

export const ddp = {
	notesRow: 0,
	namesRow: 1,
	flagsRow: 2,
	micsStartRow: 3,

	// referenceCol: 0,
	actorNamesCol: 1,
	scenesStartCol: 2,
};

export type Table = string[][];

export interface Config {
	id: number | string; // number for db configs, string for external configs
	name: string;

	notesRow: number;
	namesRow: number;
	flagsRow: number;
	micsStartRow: number;
	actorNamesCol: number;
	scenesStartCol: number;

	sheetId?: string;
	table?: Table;
	lastFetched?: Date;
}

export interface DbConfig extends Config {
	id: number;
}

export interface ExternalConfig extends Config {
	id: string;
}

export const db = new Dexie("miq") as Dexie & {
	configs: Dexie.Table<DbConfig, number>;
};
db.version(1).stores({
	configs: "++id, name",
	sheets: "++id",
});
db.version(2)
	.stores({
		configs: "++id",
		sheets: null,
	})
	.upgrade((tx) => {
		return tx
			.table<
				{
					id: number;
					name: string;
					sheetId: string;
					lastFetched?: Date;
					table?: Table;
				},
				number
			>("sheets")
			.toArray()
			.then((sheets) => {
				const sheetMap = new Map(sheets.map((sheet) => [sheet.id, sheet]));

				return tx
					.table<
						Record<string, any> & {
							sheetId?: number;
						},
						number
					>("configs")
					.toCollection()
					.modify((config) => {
						let sid = config.sheetId;
						if (sid) {
							const sheet = sheetMap.get(sid);

							if (sheet) {
								const { id, name, ...sheetProps } = sheet;
								Object.assign(config, sheetProps);
							}
						}
						delete config.sheetId;
					});
			})
			.then(() => {
				makeToast("Database migrated", "sheets data merged into configs", "info");
			})
			.catch((e) => {
				makeToast("Database error", e, "error");
			});
	});

function dexieStore<T>(querier: () => T | Promise<T>, initialValue: T): Readable<T> {
	const dexieObservable = Dexie.liveQuery(querier);
	return {
		subscribe(run, invalidate) {
			run(initialValue);
			return dexieObservable.subscribe(run, invalidate).unsubscribe;
		},
	};
}

export const storedConfigs = dexieStore(async () => await db.configs.toArray(), []);
export const externalConfigs = writable<{ [s: string]: ExternalConfig }>({});

export const configs = derived([storedConfigs, externalConfigs], ([$storedConfigs, $externalConfigs]) => {
	return [
		...($storedConfigs || []),
		...Object.keys($externalConfigs).map((id) => ({
			...$externalConfigs[id],
			id,
		})),
	];
});

export async function loadExternalConfig(
	id: string,
	source: string,
	config: Omit<Config, "sheetId"> & { sheetId?: string }
) {
	// make sure config contains all the required fields
	if (!config || !(config.sheetId || config.table)) {
		console.error("No config provided");
		return;
	}
	let newConfig = {
		...config,
		notesRow: config.notesRow ?? ddp.notesRow,
		namesRow: config.namesRow ?? ddp.namesRow,
		flagsRow: config.flagsRow ?? ddp.flagsRow,
		micsStartRow: config.micsStartRow ?? ddp.micsStartRow,
		actorNamesCol: config.actorNamesCol ?? ddp.actorNamesCol,
		scenesStartCol: config.scenesStartCol ?? ddp.scenesStartCol,
		name: source + ": " + (config.name ?? "Unnamed Config"),
		id: id,
	};
	if (!newConfig.table) {
		await new Promise<void>((resolve, reject) => {
			Papa.parse<string[]>(`https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv`, {
				download: true,
				header: false,
				complete: function (results) {
					console.log(results);
					if (results.data && results.data.length > 0 && results.data[0]?.length > 0) {
						newConfig.table = results.data;
					}
					resolve();
				},
			});
		});
	}
	externalConfigs.update((configs) => {
		return { ...configs, [id]: newConfig };
	});
	selectedConfigId.update(() => id);
}

/** refetches and updates a sheet in the db */
// todo: add support for linked mode?
export async function updateSheet(dbId: number) {
	let editing = await db.configs.get(dbId);
	if (editing?.sheetId)
		return await new Promise<DbConfig>((resolve) => {
			Papa.parse<string[]>(`https://docs.google.com/spreadsheets/d/${editing.sheetId}/export?format=csv`, {
				download: true,
				header: false,
				complete: async function (results) {
					let data = results.data,
						record = { ...editing, table: data, lastFetched: new Date() };
					if (data) {
						await db.configs.update(dbId, record);
						makeToast("Sheet updated", `"${editing?.name}"`, "info");
						resolve(record);
					}
				},
			});
		});
}
