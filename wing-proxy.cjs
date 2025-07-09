const OSC = require("osc-js");
const VERBOSE = false;

const args = process.argv.slice(2);
const UDP_HOST = args[0];
if (UDP_HOST) {
	console.log(`Using host: ${UDP_HOST}`);
} else {
	throw console.error("No host provided.");
}

const WEBSOCKET_PORT = 8080;

let config = {
	receiver: "udp",
	udpServer: {
		// https://github.com/adzialocha/osc-js/issues/74
		host: "0.0.0.0",
		port: 2223,
		exclusive: false,
	},
	udpClient: {
		host: UDP_HOST,
		port: 2223,
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
	console.log(`Listening on port ${config.wsServer.port}.`);
});

osc.on("error", (message) => {
	console.error(message);
});

osc.open();
