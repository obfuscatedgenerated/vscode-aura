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
		vscode.commands.registerCommand("vscode-aura.testAura", async () => {
			if (connected) {
				aura.set_all_to_color(aura.rgb_to_color(255, 255, 255));
				await sleep(1000);
				aura.set_all_to_color(0);
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
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function flash(color: number, times: number, duration: number) {
	if (times > 0) {
		await sleep(duration);
		aura.set_all_to_color(color);

		await sleep(duration);
		aura.set_all_to_color(0);

		await flash(color, times - 1, duration);
	} else {
		await sleep(duration);
		return Promise.resolve();
	}
}

let lastCounts = [0, 0, 0, 0];

async function intervalUpdate() {
	if (connected) {
		let config = vscode.workspace.getConfiguration("vscode-aura");
		let rawTime = config.get("timings.updateInterval", 3000) as any;
		let time = (typeof rawTime === "number") ? rawTime as number : resetNum(config, "timings", "updateInterval", rawTime) as number;

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
	let globalValue = config.inspect("colors." + k)?.globalValue;
	let workspaceFolderValue = config.inspect("colors." + k)?.workspaceFolderValue;
	let workspaceValue = config.inspect("colors." + k)?.workspaceValue;

	if (def) {
		if (globalValue === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
			config.update("colors." + k, def, vscode.ConfigurationTarget.Workspace);
		}
		return parseInt(convertForAura(def), 16);
	} else {
		if (globalValue === v) {
			config.update("colors." + k, "#FFFFFF", vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update("colors." + k, "#FFFFFF", vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
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

function resetNum(config: any, type: string, k: string, v: any) {
	vscode.window.showErrorMessage(`Invalid number ${v} for ${k}. Resetting to default...`);

	let def = config.inspect(type + "." + k)?.defaultValue as number;
	let globalValue = config.inspect(type + "." + k)?.globalValue;
	let workspaceFolderValue = config.inspect(type + "." + k)?.workspaceFolderValue;
	let workspaceValue = config.inspect(type + "." + k)?.workspaceValue;

	if (def) {
		if (globalValue === v) {
			config.update(type + "." + k, def, vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update(type + "." + k, def, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
			config.update(type + "." + k, def, vscode.ConfigurationTarget.Workspace);
		}
		return def;
	} else {
		if (globalValue === v) {
			config.update(type + "." + k, 200, vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update(type + "." + k, 200, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
			config.update(type + "." + k, 200, vscode.ConfigurationTarget.Workspace);
		}
		return 200;
	}
}

function validateNums(config: any, type: string, values: ITimingConfig | IThresholdConfig) {
	return Object.fromEntries(
		Object.entries(values).map(([k, v]) => {
			let val: number;
			if (typeof v === "number" && v >= 0) {
				val = v;
			} else {
				val = resetNum(config, type, k, v);
			}
			return [k as keyof typeof values, val];
		})
	);
}

function resetBool(config: any, k: string, v: any) {
	vscode.window.showErrorMessage(`Invalid boolean ${v} for ${k}. Resetting to default...`);

	let def = config.inspect(k)?.defaultValue as boolean;
	let globalValue = config.inspect(k)?.globalValue;
	let workspaceFolderValue = config.inspect(k)?.workspaceFolderValue;
	let workspaceValue = config.inspect(k)?.workspaceValue;

	if (def) {
		if (globalValue === v) {
			config.update(k, def, vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update(k, def, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
			config.update(k, def, vscode.ConfigurationTarget.Workspace);
		}
		return def;
	} else {
		if (globalValue === v) {
			config.update(k, false, vscode.ConfigurationTarget.Global);
		} else if (workspaceFolderValue === v) {
			config.update(k, false, vscode.ConfigurationTarget.WorkspaceFolder);
		} else if (workspaceValue === v) {
			config.update(k, false, vscode.ConfigurationTarget.Workspace);
		}
		return false;
	}
}

function validateBool(config: any, k: string, v: any) {
	let val: boolean;
	if (typeof v === "boolean") {
		val = v;
	} else {
		val = resetBool(config, k, v);
	}
	return val;
}

async function updateLight() {
	let config = vscode.workspace.getConfiguration("vscode-aura");
	let diag = vscode.languages.getDiagnostics();

	if (validateBool(config, "onlyVisibleFiles", config.get("onlyVisibleFiles", false))) {
		diag = diag.filter(([uri, d]) => {
			if (vscode.window.visibleTextEditors.find(e => e.document.uri === uri) || vscode.window.visibleNotebookEditors.find(e => e.notebook.uri === uri)) {
				return true;
			} else {
				return false;
			}
		});
	}

	let colors = config.get("colors") as IColorConfig;
	let parsedColors = parseColors(colors, config);
	let timings = validateNums(config, "timings", config.get("timings") as ITimingConfig);
	let thresholds = validateNums(config, "thresholds", config.get("thresholds") as IThresholdConfig);

	let errors = 0;
	let warnings = 0;
	let infos = 0;
	let other = 0;

	for (let i in diag) {
		let notices = diag[i][1];
		for (let j in notices) {
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

	if ([errors, warnings, infos, other].join() === lastCounts.join()) {
		return;
	}

	lastCounts = [errors, warnings, infos, other];

	if (errors >= thresholds.errorMinimum) {
		if (errors < thresholds.errorHigh) {
			await flash(parsedColors.error, errors, timings.errorBlink);
		} else {
			aura.set_all_to_color(parsedColors.error);
			await sleep(timings.errorHold);
			aura.set_all_to_color(0);
		}
	}

	if (warnings >= thresholds.warningMinimum) {
		if (warnings < thresholds.warningHigh) {
			await flash(parsedColors.warning, warnings, timings.warningBlink);
		} else {
			aura.set_all_to_color(parsedColors.warning);
			await sleep(timings.warningHold);
			aura.set_all_to_color(0);
		}
	}

	if (infos >= thresholds.infoMinimum) {
		if (infos < thresholds.infoHigh) {
			await flash(parsedColors.info, infos, timings.infoBlink);
		} else {
			aura.set_all_to_color(parsedColors.info);
			await sleep(timings.infoHold);
			aura.set_all_to_color(0);
		}
	}
}