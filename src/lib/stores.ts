import { writable, get } from "svelte/store";
import type { BaseConnection } from "./connections/baseConnection";
import type { connectors } from "./connectionUtil";
import type { Config } from "./db";
import type { M7CLConfig, MixingStationConfig, OSCConfig } from "./types";
import type { MqttConfig } from "./mqtt";

export const showingModal = writable<"settings" | "dbConfig" | null>(null);

function localStorageWritable<T>(key: string, defaultValue: T) {
	const storedValue = localStorage.getItem(key);
	const store = writable<T>(storedValue !== null ? JSON.parse(storedValue) : defaultValue);

	store.subscribe((value) => localStorage.setItem(key, JSON.stringify(value)));
	return store;
}

export const selectedConfigId = localStorageWritable<Config["id"] | null>("selectedConfig", null);

export const mqttConfig = localStorageWritable<MqttConfig>("mqttConfig", {
	mode: "tx",
	rx_preview: true,
	rx_live: false,
});
export const mqttStatus = writable({ connected: false, address: null });

export const connectionMode = localStorageWritable<keyof typeof connectors>("connectionMode", "osc");

export const oscConfig = localStorageWritable<Partial<OSCConfig>>("oscConfig", {});
export const msConfig = localStorageWritable<Partial<MixingStationConfig>>("msConfig", {});
export const m7clConfig = localStorageWritable<Partial<M7CLConfig>>("m7clConfig", {});

export const appConfig = localStorageWritable<{ flipSceneOrder?: boolean }>("appConfig", {});

export const currentConnection = writable<BaseConnection | null>(null);

/** @enum {number} */
export const ConnectionStatusEnum = {
	DISCONNECTED: 0,
	// truthy values are not disconnected
	CONNECTED: 1,
	CONNECTING: 2,
} as const;
export const currentConnectionStatus = writable<{
	status: (typeof ConnectionStatusEnum)[keyof typeof ConnectionStatusEnum];
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

export const toasts = writable<
	{
		title: string;
		message: string;
		type: "info" | "warn" | "error";
		id: number;
	}[]
>([]);
export function makeToast(title: string, message: string, type: "info" | "warn" | "error" = "info") {
	toasts.update((toasts) => {
		toasts.push({ title, message, type, id: Date.now() });
		return toasts;
	});
}

if (window) (window as any).makeToast = makeToast;
