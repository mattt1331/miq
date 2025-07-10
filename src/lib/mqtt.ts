import Paho from "paho-mqtt";
import { get, writable } from "svelte/store";
import { ConnectionStatusEnum, makeToast, mqttConfig, mqttStatus } from "./stores";

export let mqttClient: Paho.Client;

export let incomingMessage = writable<Paho.Message | null>(null);

export interface MqttConfig {
	host?: string;
	port?: number;
	basepath?: string;
	topic?: string;
	useAuth?: boolean;
	username?: string;
	password?: string;
	mode?: "tx" | "rx";
	rx_preview: boolean;
	rx_live: boolean;
	// todo: add autoconnect
}

export function getCompleteMqttConfig(config: MqttConfig) {
	return {
		...config,
		port: config.port || 443,
		basepath: config.basepath || "/ws",
		useAuth: config.useAuth ?? false,
		username: config.username,
		password: config.password,
	};
}

export function connect() {
	const config = getCompleteMqttConfig(get(mqttConfig));
	if (!config || !config.host || !config.topic) {
		makeToast("Bad MQTT Config", "Provide at least a host and topic", "info");
		return;
	}
	mqttStatus.update(() => ({ status: ConnectionStatusEnum.CONNECTING }));
	const clientID = "miq-" + Math.random().toString(16);
	mqttClient = new Paho.Client(config.host, config.port, config.basepath, clientID);
	let willMessage = new Paho.Message("{}");
	willMessage.destinationName = "miq/" + config.topic + "/config";
	/** @type {Paho.ConnectionOptions} */
	const connectionOptions: Paho.ConnectionOptions = {
		onSuccess: () => {
			console.log("MQTT: Connected as " + clientID);
			mqttStatus.update(() => ({ status: ConnectionStatusEnum.CONNECTED }));
			mqttClient.subscribe("miq/" + config.topic + "/#");
		},
		onFailure: (e) => {
			console.error("MQTT: Connection failed", e);
			makeToast("MQTT connection failed", e.errorMessage, "error");
			mqttStatus.update(() => ({ status: ConnectionStatusEnum.DISCONNECTED }));
			// setTimeout(() => {
			// 	client.connect(connectionOptions);
			// }, 2000);
		},
		useSSL: true,
		willMessage: willMessage,
		keepAliveInterval: 10,
		reconnect: true,
	};

	if (config.useAuth) {
		connectionOptions.userName = config.username;
		connectionOptions.password = config.password;
	} else {
		delete connectionOptions.userName;
		delete connectionOptions.password;
	}

	mqttClient.onMessageArrived = (message) => {
		console.log("MQTT: Message arrived", message);
		incomingMessage.update((_) => message);
	};

	mqttClient.connect(connectionOptions);
}

export function disconnect() {
	mqttClient && mqttClient.disconnect();
	mqttStatus.update(() => ({ status: ConnectionStatusEnum.DISCONNECTED }));
}
