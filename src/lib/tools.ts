import { get } from "svelte/store";
import { scenes } from "./configState.svelte";

export const tools = {
	micChangesByScene: () => {
		let total = 0,
			summary = "",
			seen = new Map<number, boolean>();
		for (const scene of get(scenes)) {
			let add = "";
			for (const [micNum, micState] of scene.mics) {
				if (micState.switchingFrom) {
					if (seen.get(micNum) === false) {
						add += `#${micNum}: ${micState.switchingFrom} -> ${micState.actor}\n`;
						total++;
						seen.set(micNum, true);
					}
				} else {
					seen.set(micNum, false);
				}
			}
			if (add) {
				const sceneName = scene.name.replace(/\s*\(.*?\)\s*$/, "");

				summary += `\n${sceneName}:\n`;
				summary += add;
			}
		}
		summary = `Total mic changes: ${total}\n` + summary;
		return summary.trim();
	},
};
