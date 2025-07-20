import { get, writable } from "svelte/store";
import { connectors } from "./connections";
import type { BaseConnection } from "./connections/baseConnection";
import type { Config } from "./db";
import type { MqttConfig } from "./mqtt";
import type { M7CLConfig, MixingStationConfig, PageId, Toast, WingConfig, X32Config } from "./types";

export const showingPage = writable<PageId | null>(null);
export const showingDialog = writable(false); // todo: move to pages

export function localStorageWritable<T>(key: string, defaultValue: T) {
	const storedValue = localStorage.getItem(key);
	const store = writable<T>(storedValue !== null ? JSON.parse(storedValue) : defaultValue);

	store.subscribe((value) => localStorage.setItem(key, JSON.stringify(value)));
	return store;
}

export enum ConnectionStatusEnum {
	DISCONNECTED = 0,
	// truthy values are not disconnected
	CONNECTED = 1,
	CONNECTING = 2,
}

export const selectedConfigId = localStorageWritable<Config["id"] | null>("selectedConfig", null);

export const mqttConfig = localStorageWritable<MqttConfig>("mqttConfig", {
	mode: "tx",
	rx_preview: false,
	rx_live: true,
});
export const mqttStatus = writable<{
	status: ConnectionStatusEnum;
}>({ status: ConnectionStatusEnum.DISCONNECTED });

export const connectionMode = localStorageWritable<keyof typeof connectors>("connectionMode", "x32");
connectionMode.update((mode) => {
	if (!(mode in connectors)) {
		return "x32"; // default to x32 if the mode is not valid
	}
	return mode;
});

export const x32Config = localStorageWritable<Partial<X32Config>>("x32Config", {});
export const msConfig = localStorageWritable<Partial<MixingStationConfig>>("msConfig", {});
export const m7clConfig = localStorageWritable<Partial<M7CLConfig>>("m7clConfig", {});
export const wingConfig = localStorageWritable<Partial<WingConfig>>("wingConfig", {});

export const appConfig = localStorageWritable<{ flipSceneOrder?: boolean }>("appConfig", {
	flipSceneOrder: false,
});

export const currentConnection = writable<BaseConnection | null>(null);
currentConnection.subscribe((connection) => {
	(window as any).connection = connection;
});

export const currentConnectionStatus = writable<{
	status: ConnectionStatusEnum;
	address: string | null;
}>({ status: ConnectionStatusEnum.DISCONNECTED, address: null });

// disconnect when switching modes
let lastConnectionMode: keyof typeof connectors | null = null;
connectionMode.subscribe((mode) => {
	if (mode !== lastConnectionMode) {
		lastConnectionMode = mode;
		get(currentConnection)?.close();
	}
});

// fixme: move to state
export const channelOverrides = writable<{
	[key: number]: { disableControl?: boolean; channelNumber?: number };
}>({});

export const channelMeters = writable<Float32Array>(new Float32Array());

export const toasts = writable<Toast[]>([]);
export function makeToast(title: string, message: string, type: "info" | "warn" | "error" = "info") {
	toasts.update((toasts) => {
		toasts.push({ title, message, type, id: Date.now() });
		return toasts;
	});
}

if (window) (window as any).makeToast = makeToast;
