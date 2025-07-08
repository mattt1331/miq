import OSC from "osc-js";
import { get } from "svelte/store";
import { channelMeters, makeToast, wingConfig, currentConnectionStatus, ConnectionStatusEnum } from "../stores";
import { BaseConnection } from "./baseConnection";
import type { BaseColor } from "../types";

// https://wing-docs.com/article/osc
// https://drive.google.com/file/d/1-iptgd2Uxw4qPEbmegG2Sqccf8AbRRfk/view

interface OSCMessage {
	address: string;
	args: Array<{ buffer: ArrayBuffer }>;
}

export class WingConnection extends BaseConnection {
	static name = "wing-proxy";

	client: OSC;
	liveRequestInterval: ReturnType<typeof setInterval> | undefined;

	static readonly colors = {
		CYAN: 2,
		RED: 9,
		MAGENTA: 11,
	} as const;

	constructor() {
		super();

		const config = WingConnection.getCompleteConfig();

		this.client = new OSC({
			plugin: new OSC.WebsocketClientPlugin({
				host: config.host,
				port: config.port,
				secure: false,
			}),
		});

		if (window) (window as any).oscClient = this.client;

		// this.client.on("/meters/*", (message: OSCMessage) => {
		// 	console.log(message.address, message.args);
		// 	if (message.address === "/meters/6") {
		// 		let meters = new Float32Array(message.args[0].buffer.slice(16));
		// 		console.log(meters[0]);
		// 	} else if (message.address === "/meters/1") {
		// 		let meters = new Float32Array(message.args[0].buffer.slice(24));
		// 		let levels = meters.slice(0, 32);
		// 		for (let i = 0; i < levels.length; i++) {
		// 			levels[i] = Math.pow(levels[i], 0.5);
		// 		}
		// 		channelMeters.set(levels);
		// 	}
		// });

		this.client.on("open", () => {
			currentConnectionStatus.set({
				status: ConnectionStatusEnum.CONNECTED,
				address: config.host + ":" + config.port,
			});
			// const liveRequestFunction = () => {
			// 	if (config.liveMetersEnabled) {
			// 		this.client.send(new OSC.Message("/meters", "/meters/1"));
			// 	}
			// };
			// liveRequestFunction();
			// this.liveRequestInterval = setInterval(liveRequestFunction, 5000);
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
		let cmnd = `$name='${name.replaceAll("'", "").substring(0, 16)}',col=${WingConnection.colors[color]}`;
		if (active !== null) cmnd += `,active=${active ? 1 : 0}`;
		const message = new OSC.Message(`/ch/${channel}`, cmnd);
		console.log("Sending message:", message);

		this.client.send(message);
	}

	static getCompleteConfig() {
		const config = get(wingConfig);
		return {
			...BaseConnection.getCompleteConfig(),
			...config,
			host: config.host || "localhost",
			port: config.port || 8080,
		};
	}

	close(ungraceful = false) {
		super.close(ungraceful);
		this.client.close();
		if (this.liveRequestInterval) clearInterval(this.liveRequestInterval);
	}
}
