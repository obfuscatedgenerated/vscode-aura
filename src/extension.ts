import * as vscode from "vscode";

import * as aura from "./aura_sdk";
import { IColorConfig, ITimingConfig, IThresholdConfig } from "./types";

let connected = false;

export function activate(context: vscode.ExtensionContext) {

	try {
		aura.init();
		connected = true;
	} catch (e) {
		console.error(e);
		if (e instanceof Error) {
			vscode.window.showErrorMessage(e.message);
		}
	}

	console.log("\"vscode-aura\" is now active.");

	aura.set_all_to_color(0);


	context.subscriptions.push(
		vscode.commands.registerCommand("vscode-aura.testAura", () => {
			if (connected) {
				aura.set_all_to_color(aura.rgb_to_color(255, 255, 255));
				setTimeout(() => {
					aura.set_all_to_color(0);
				}, 1000);
				vscode.window.showInformationMessage("Aura is connected!");
			} else {
				vscode.window.showInformationMessage("Aura is not connected!");
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vscode-aura.closeAura", () => {
			aura.close();
			connected = false;
			vscode.window.showInformationMessage("Closed connection to Aura. Reload the extension to reconnect.");
		})
	);
	intervalUpdate();
}

export function deactivate() {
	if (connected) {
		aura.close();
	}
}

const sleep = (milliseconds: number) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
};

async function flash(color: number, times: number, duration: number) {
	if (times > 0) {
		await sleep(duration);
		aura.set_all_to_color(color);

		await sleep(duration);
		aura.set_all_to_color(0);

		await flash(color, times - 1, duration);
	} else {
		return Promise.resolve();
	}
}

let last_counts = [0, 0, 0, 0];

async function intervalUpdate() {
	if (connected) {
		let config = vscode.workspace.getConfiguration("vscode-aura");
		let time = config.get("timings.updateInterval", 3000) as number;

		await updateLight();
		await sleep(time);
		intervalUpdate();
	}
}

function convertForAura(color: string) {
	if (color.startsWith("#")) { // remove leading #
		color = color.substring(1);
	}

	if (color.length === 4) { // if RGBA, convert to RGB
		color = color.substring(0, 5);
	}
	if (color.length === 8) { // if RRGGBBAA, convert to RRGGBB
		color = color.substring(0, 7);
	}
	if (color.length === 3) { // if RGB, convert to RRGGBB
		color = color.split("").map(c => c + c).join("");
	}

	return color.substring(4, 6) + color.substring(2, 4) + color.substring(0, 2); // rearrange to BBGGRR
}

function resetColor(config: any, k: string, v: string) {
	vscode.window.showErrorMessage(`Invalid color ${v} for ${k}. Resetting to default...`);

	let def = config.inspect("colors." + k)?.defaultValue as string;
	let global_v = config.inspect("colors." + k)?.globalValue;
	let wf_v = config.inspect("colors." + k)?.workspaceFolderValue;
	let w_v = config.inspect("colors." + k)?.workspaceValue;

	if (def) {
		if (global_v === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.Global);
		} else if (wf_v === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (w_v === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.Workspace);
		}
		return parseInt(convertForAura(def), 16);
	} else {
		if (global_v === v) {
			config.update("colors." + k, "#FFFFFF", vscode.ConfigurationTarget.Global);
		} else if (wf_v === v) {
			config.update("colors." + k, "#FFFFFF", vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (w_v === v) {
			config.update("colors." + k, "#FFFFFF", vscode.ConfigurationTarget.Workspace);
		}
		return parseInt("FFFFFF", 16);
	}
}

function parseColors(colors: IColorConfig, config: any) {
	return Object.fromEntries(
		Object.entries(colors).map(([k, v]) => {
			let val: number;
			if (typeof v === "string") {
				val = parseInt(convertForAura(v), 16);
				if (isNaN(val)) {
					val = resetColor(config, k, v);
				}
			} else {
				val = resetColor(config, k, v);
			}
			return [k as keyof typeof colors, val];
		})
	);
}

async function updateLight() {
	let config = vscode.workspace.getConfiguration("vscode-aura");
	let diag = vscode.languages.getDiagnostics();

	let colors = config.get("colors") as IColorConfig;
	let parsed_colors = parseColors(colors, config);
	let timings = config.get("timings") as ITimingConfig;
	let thresholds = config.get("thresholds") as IThresholdConfig;

	let errors = 0;
	let warnings = 0;
	let infos = 0;
	let other = 0;

	for (let i = 0; i < diag.length; i++) {
		let notices = diag[i][1];
		for (let j = 0; j < notices.length; j++) {
			let notice = notices[j];
			if (notice.severity === vscode.DiagnosticSeverity.Error) {
				errors++;
			} else if (notice.severity === vscode.DiagnosticSeverity.Warning) {
				warnings++;
			} else if (notice.severity === vscode.DiagnosticSeverity.Information) {
				infos++;
			} else {
				other++;
			}
		}
	}

	if ([errors, warnings, infos, other].join() === last_counts.join()) {
		return;
	}

	last_counts = [errors, warnings, infos, other];

	if (errors >= thresholds.errorMinimum) {
		if (errors < thresholds.errorHigh) {
			await flash(parsed_colors.error, errors, timings.errorBlink);
		} else {
			aura.set_all_to_color(parsed_colors.error);
			await sleep(timings.errorHold);
			aura.set_all_to_color(0);
		}
	}

	if (warnings >= thresholds.warningMinimum) {
		if (warnings < thresholds.warningHigh) {
			await flash(parsed_colors.warning, warnings, timings.warningBlink);
		} else {
			aura.set_all_to_color(parsed_colors.warning);
			await sleep(timings.warningHold);
			aura.set_all_to_color(0);
		}
	}

	if (infos >= thresholds.infoMinimum) {
		if (infos < thresholds.infoHigh) {
			await flash(parsed_colors.info, infos, timings.infoBlink);
		} else {
			aura.set_all_to_color(parsed_colors.info);
			await sleep(timings.infoHold);
			aura.set_all_to_color(0);
		}
	}
}