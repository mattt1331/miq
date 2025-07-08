export interface BaseConnectionConfig {
	resendNum: number;
	autoReconnect: boolean;
	liveMetersEnabled: boolean;
}

export interface OSCConfig extends BaseConnectionConfig {
	host: string;
	port: number;
	secure: boolean;
}

export interface MixingStationConfig extends BaseConnectionConfig {
	host: string;
	port: number;
	secure: boolean;
}

export interface M7CLConfig extends BaseConnectionConfig {
	host: string;
	inputHost: string;
	liveMeterPoint: number;
}

export type BaseColor = "RED" | "CYAN" | "MAGENTA";

export interface MicState {
	active: boolean;
	character: string;
	actor: string;
	switchingFrom?: string;
	switchingTo?: string;
}

export interface Scene {
	name: string;
	notes: string;
	mics: Map<number, MicState>;
}
