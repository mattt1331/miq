import { ddp, type Config, type Table } from "./db";
import type { Scene } from "./types";

export function regenerateScenes(selectedConfig: Config) {
	console.log("regenerating scenes");

	const config = {
		notesRow: selectedConfig.notesRow ?? ddp.notesRow,
		namesRow: selectedConfig.namesRow ?? ddp.namesRow,
		flagsRow: selectedConfig.flagsRow ?? ddp.flagsRow,
		micsStartRow: selectedConfig.micsStartRow ?? ddp.micsStartRow,
		actorNamesCol: selectedConfig.actorNamesCol ?? ddp.actorNamesCol,
		scenesStartCol: selectedConfig.scenesStartCol ?? ddp.scenesStartCol,
	};

	if (selectedConfig.table && selectedConfig.table.length > 0 && selectedConfig.table[0]?.length > 0) {
		let table = selectedConfig.table;
		let newScenes: Scene[] = [];
		let actorMicPairs = new Map<number, { row: number; actor: string }>();

		function generateActorMicPairs(col: number) {
			for (let j = config.micsStartRow; j < table.length; j++) {
				const micNum = parseInt(table[j][col]);
				if (!Number.isNaN(micNum) && micNum > 0) {
					actorMicPairs.set(micNum, {
						row: j,
						actor: table[j][config.actorNamesCol],
					});
				}
			}
		}

		for (let i = config.scenesStartCol; i < table[0].length; i++) {
			if (table[config.flagsRow][i].includes("MIC_CHANGE")) {
				generateActorMicPairs(i);
				continue;
			}

			let mics: Scene["mics"] = new Map();
			actorMicPairs.forEach(({ row, actor }, micNum) => {
				mics.set(micNum, {
					actor: actor,
					character: table[row][i],
					active: table[row][i].trim() !== "" && table[row][i].trim().slice(0, 2) !== "//",
				});
			});
			newScenes.push({
				notes: table[config.notesRow][i],
				name: table[config.namesRow][i],
				mics,
			});
		}

		// backward pass
		let backwardPassMem = new Map<number, string>();
		newScenes.reverse();
		newScenes.forEach((scene) => {
			scene.mics.forEach((mic, micNum) => {
				let mem = backwardPassMem.get(micNum);

				if (mem && !mic.active) {
					mic.actor = mem;
				} else {
					backwardPassMem.set(micNum, mic.actor);
				}
			});
		});

		// forward pass
		let forwardPassMem = new Map<number, string>();
		newScenes.reverse();
		newScenes.forEach((scene) => {
			scene.mics.forEach((mic, micNum) => {
				let mem = forwardPassMem.get(micNum);

				if (mem && !mic.active && mem !== mic.actor) {
					mic.switchingFrom = mem;
				} else {
					forwardPassMem.set(micNum, mic.actor);
				}
			});
		});

		return newScenes;
	} else {
		return [];
	}
}
