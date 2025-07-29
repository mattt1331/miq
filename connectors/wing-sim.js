import dgram from "dgram";
import { networkInterfaces } from "os";
import OSC from "osc-js";

// dummy script to test without an actual wing device

// --- Configuration ---
const DISCOVERY_PORT = 2222;
const OSC_PORT = 2223;

// --- Simulated Device Details ---
const SIMULATED_IP = Object.values(networkInterfaces())
	.flat()
	.filter(({ family, internal, mac }) => family === "IPv4" && !internal && mac !== "00:00:00:00:00:00")
	.map(({ address }) => address)[0];
const SIMULATED_NAME = "Dummy-Wing";
const SIMULATED_MODEL = "WING-SIM";
const SIMULATED_SERIAL = "SIM-SN-001";
const SIMULATED_FIRMWARE = "1.14";

// =================================================================
// 1. Discovery Server (Responds to "WING?")
// =================================================================
const discoveryServer = dgram.createSocket("udp4");

discoveryServer.on("listening", () => {
	const address = discoveryServer.address();
	console.log(`✅ Discovery server listening on ${address.address}:${address.port}`);
	console.log('   Waiting for "WING?" broadcast...');
});

discoveryServer.on("message", (msg, rinfo) => {
	const message = msg.toString("utf8");
	console.log(`\n📬 [Discovery] Received: "${message}" from ${rinfo.address}:${rinfo.port}`);

	if (message === "WING?") {
		// get my local ip

		const responsePayload = [
			"WING",
			SIMULATED_IP,
			SIMULATED_NAME,
			SIMULATED_MODEL,
			SIMULATED_SERIAL,
			SIMULATED_FIRMWARE,
		].join(",");

		const responseBuffer = Buffer.from(responsePayload);

		discoveryServer.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
			if (err) {
				console.error("Error sending discovery response:", err);
			} else {
				console.log(`🚀 [Discovery] Sent simulated response to ${rinfo.address}:${rinfo.port}`);
			}
		});
	}
});

discoveryServer.on("error", (err) => {
	console.error("Discovery server error:", err);
	discoveryServer.close();
});

// Start the discovery server
discoveryServer.bind(DISCOVERY_PORT);

// =================================================================
// 2. OSC Server (Receives and logs OSC messages)
// =================================================================
const osc = new OSC({
	plugin: new OSC.DatagramPlugin({
		open: {
			port: OSC_PORT,
			host: "0.0.0.0",
			exclusive: false, // Allow multiple clients to connect
		},
	}),
});

// Log any incoming OSC message
osc.on("*", (message, rinfo) => {
	console.log("🎼 [OSC] Received message:", JSON.stringify(message, null, "\t"), rinfo);
	osc.send(new OSC.Message(message.address + "*", "OK"), { host: rinfo.address, port: 2223 });
});

osc.on("open", () => {
	console.log(`✅ OSC server listening on port ${OSC_PORT}`);
});

osc.on("error", (err) => {
	console.error("OSC server error:", err);
});

// Start the OSC server
osc.open();
