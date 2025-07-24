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
						add += `#${micNum}: ${micState.switchingFrom} → ${micState.actor}\n`;
						total++;
						seen.set(micNum, true);
					}
				} else {
					seen.set(micNum, false);
				}
			}
			if (add) {
				summary += `\n${scene.name.replace(/\s*\(.*?\)\s*$/, "")}:\n`;
				summary += add;
			}
		}
		summary = `Total mic changes: ${total}\n` + summary;
		return summary.trim();
	},

	micChangesByMic: () => {
		let data = new Map<number, [boolean, string[], string[]]>();

		for (const scene of get(scenes)) {
			for (const [micNum, micState] of scene.mics) {
				let [_seen, pages, actors] = data.get(micNum) ?? [false, [], [micState.actor]];

				if (micState.switchingFrom) {
					if (!_seen) {
						_seen = true;
						pages.push(scene.name.match(/\w+?\b/)?.[0] ?? scene.name);
						actors.push(micState.actor);
					}
				} else {
					_seen = false;
				}

				data.set(micNum, [_seen, pages, actors]);
			}
		}

		let summary = "";
		for (const [micNum, [_, pages, actors]] of [...data.entries()].sort((a, b) => a[0] - b[0])) {
			summary += `#${micNum}\t${pages.join(", ")}\t${actors.join(" → ")}\n`;
		}
		return summary.trim();
	},
};
