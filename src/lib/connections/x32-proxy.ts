import OSC from "osc-js";
import { get } from "svelte/store";
import { channelMeters, makeToast, x32Config, currentConnectionStatus, ConnectionStatusEnum } from "../stores";
import { BaseConnection } from "./baseConnection";
import type { BaseColor } from "../types";

interface OSCMessage {
	address: string;
	args: Array<{ buffer: ArrayBuffer }>;
}

export class X32Connection extends BaseConnection {
	static name = "x32-proxy";
	static fullName = "Music Tribe X32/M32 (OSC)";

	client: OSC;
	liveRequestInterval: ReturnType<typeof setInterval> | undefined;

	static readonly colors = {
		BLACK: 0,
		RED: 1,
		GREEN: 2,
		YELLOW: 3,
		BLUE: 4,
		MAGENTA: 5,
		CYAN: 6,
		WHITE: 7,
		"BLACK INV": 8,
		"RED INV": 9,
		"GREEN INV": 10,
		"YELLOW INV": 11,
		"BLUE INV": 12,
		"MAGENTA INV": 13,
		"CYAN INV": 14,
		"WHITE INV": 15,
	} as const;

	constructor() {
		super();

		const config = X32Connection.getCompleteConfig();

		this.client = new OSC({
			plugin: new OSC.WebsocketClientPlugin({
				host: config.host,
				port: config.port,
				secure: config.secure,
			}),
		});

		// if (window) window.oscClient = this.client;

		this.client.on("/meters/*", (message: OSCMessage) => {
			console.log(message.address, message.args);
			if (message.address === "/meters/6") {
				let meters = new Float32Array(message.args[0].buffer.slice(16));
				console.log(meters[0]);
			} else if (message.address === "/meters/1") {
				let meters = new Float32Array(message.args[0].buffer.slice(24));
				let levels = meters.slice(0, 32);
				for (let i = 0; i < levels.length; i++) {
					levels[i] = Math.pow(levels[i], 0.5);
				}
				channelMeters.set(levels);
			}
		});

		this.client.on("open", () => {
			currentConnectionStatus.set({
				status: ConnectionStatusEnum.CONNECTED,
				address: config.host + ":" + config.port,
			});
			const liveRequestFunction = () => {
				if (config.liveMetersEnabled) {
					this.client.send(new OSC.Message("/meters", "/meters/1"));
				}
			};
			liveRequestFunction();
			this.liveRequestInterval = setInterval(liveRequestFunction, 5000);
		});
		this.client.on("close", () => {
			this._onSocketClose();
			clearInterval(this.liveRequestInterval);
		});
		this.client.on("error", (e: Event & { target: WebSocket }) => {
			console.error("OSC Error", e);
			// let onclose handle close
			if (e?.target?.readyState !== 3) {
				makeToast("OSC Error", "", "error");
				clearInterval(this.liveRequestInterval);
			}
		});
		this.client.open();
		// try {
		// } catch (error) {
		// 	makeToast("Error opening OSC", error, "error");
		// }
	}

	override _fireChannel(channel: number, active: boolean | null, name: string, color: BaseColor): void {
		let ch = (channel < 10 ? "0" : "") + channel;
		if (active !== null) this.client.send(new OSC.Message(`/ch/${ch}/mix/on`, active ? 780 : 0));
		this.client.send(new OSC.Message(`/ch/${ch}/config/name`, name));
		this.client.send(new OSC.Message(`/ch/${ch}/config/color`, X32Connection.colors[color]));
	}

	static getCompleteConfig() {
		const config = get(x32Config);
		return {
			...BaseConnection.getCompleteConfig(),
			...config,
			host: config.host || "localhost",
			port: config.port || 8080,
			secure: config.secure ?? false,
		};
	}

	close(ungraceful = false) {
		super.close(ungraceful);
		this.client.close();
		clearInterval(this.liveRequestInterval);
	}
}
