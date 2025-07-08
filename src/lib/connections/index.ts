import { X32Connection } from "./x32-proxy";
import { MixingStationConnection } from "./mixing-station";
import { M7CLConnection } from "./m7cl";
import { WingConnection } from "./wing-proxy";

export const connectors = {
	x32: X32Connection,
	ms: MixingStationConnection,
	m7cl: M7CLConnection,
	wing: WingConnection,
} as const;
