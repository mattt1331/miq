const OSC = require("osc-js");
const VERBOSE = true;

const args = process.argv.slice(2);
const host = args[0];
if (host) {
	console.log(`Using host: ${host}`);
} else {
	throw console.error("No host provided.");
}

let config = {
	udpClient: {
		port: 2223,
		host,
	},
	wsServer: {
		host: "localhost",
		port: 8080,
	},
};

const osc = new OSC({ plugin: new OSC.BridgePlugin(config) });

if (VERBOSE) {
	console.log("Verbose is ON. It will print *all* OSC messages, so performance will be degraded.");
	osc.on("/*", (message) => {
		console.log(message);
	});
}

osc.on("open", () => {
	console.log(`Listening on port ${config.wsServer.port}.`);
});

osc.open();
