import { X32Connection } from "./x32-proxy";
import { MixingStationConnection } from "./mixing-station";
import { M7CLConnection } from "./m7cl";
import { WingConnection } from "./wing-proxy";

export const connectors = {
	ms: MixingStationConnection,
	x32: X32Connection,
	wing: WingConnection,
	m7cl: M7CLConnection,
} as const;
