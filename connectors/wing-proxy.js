import { createSocket } from "dgram";
import OSC from "osc-js";

const VERBOSE = true;
const NATIVE_PORT = 2222;
const OSC_PORT = 2223;
const WEBSOCKET_PORT = 8080;

function discover(timeout = 5000) {
	return new Promise((resolve, reject) => {
		const client = createSocket("udp4");
		let timeoutId = null;

		const cleanup = () => {
			clearTimeout(timeoutId);
			client.close();
		};

		timeoutId = setTimeout(() => {
			cleanup();
			reject(new Error(`Discovery timed out after ${timeout / 1000} seconds.`));
		}, timeout);

		client.on("error", (err) => {
			cleanup();
			reject(err);
		});

		client.on("message", (msg) => {
			const response = msg.toString("utf8");
			const tokens = response.split(",");

			// WING,ip,name,model,serial,firmware
			if (tokens.length >= 6 && tokens[0] === "WING") {
				console.log(tokens);
				cleanup();
				resolve(tokens[1]);
			}
		});

		client.on("listening", () => {
			client.setBroadcast(true);
			client.send(Buffer.from("WING?"), NATIVE_PORT, "255.255.255.255", (err) => {
				if (err) {
					cleanup();
					reject(err);
				}
			});
		});

		client.bind();
	});
}

const args = process.argv.slice(2);
let UDP_HOST = args[0];
if (!UDP_HOST) {
	console.log("No host provided, discovering WING device...");
	UDP_HOST = await discover();
}
console.log(`Using host: ${UDP_HOST}`);

let config = {
	receiver: "udp",
	udpServer: {
		// https://github.com/adzialocha/osc-js/issues/74
		host: "0.0.0.0",
		port: OSC_PORT,
		exclusive: false,
	},
	udpClient: {
		host: UDP_HOST,
		port: OSC_PORT,
	},
	wsServer: {
		host: "localhost",
		port: WEBSOCKET_PORT,
	},
};

const osc = new OSC({ plugin: new OSC.BridgePlugin(config) });

if (VERBOSE) {
	console.log("Verbose output is enabled. All messages will be logged.");
	osc.on("*", (message, rinfo) => {
		console.log(message, rinfo);
	});
}

osc.on("open", () => {
	console.log(`WebSockets listening on port ${config.wsServer.host}:${config.wsServer.port}.`);

	/** @type {import('dgram').Socket} */
	let oscSocket = osc.options.plugin.socket;
	console.log(`OSC server listening on ${oscSocket.address().address}:${oscSocket.address().port}.`);
});

osc.on("error", (message) => {
	console.error(message);
});

osc.open();
