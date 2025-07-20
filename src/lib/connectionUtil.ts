import { get, writable } from "svelte/store";
import { connectors } from "./connections";
import { connectionMode, currentConnection, currentConnectionStatus, m7clConfig, msConfig, x32Config } from "./stores";

const updateAddress = () => {
	const currentAddress = get(currentConnectionStatus).address;
	if (currentAddress) return connectionAddress.set(currentAddress);

	const mode = get(connectionMode);
	// todo: separate connecting from instantiating classes
	const config = connectors[mode]?.getCompleteConfig() || null;

	return connectionAddress.set((config?.host || "") + ("port" in config ? `:${config?.port}` : ""));
};
export const connectionAddress = writable<string | null>(null);

// update the probable next address anytime any connection stuff changes
currentConnectionStatus.subscribe(updateAddress);
connectionMode.subscribe(updateAddress);
x32Config.subscribe(updateAddress);
msConfig.subscribe(updateAddress);
m7clConfig.subscribe(updateAddress);

export function newConnection() {
	const mode = get(connectionMode);
	currentConnection.set(connectors[mode] ? new connectors[mode]() : null);
}
