import * as vscode from "vscode";

import * as aura from "./aura_sdk";

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

	vscode.languages.onDidChangeDiagnostics(
		(e: vscode.DiagnosticChangeEvent) => debounce(() => { updateLight(e); }, 10000)(),
		null,
		context.subscriptions
	);
}

export function deactivate() {
	if (connected) {
		aura.close();
	}
}

const sleep = (milliseconds: number) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
};

const debounce = (fn: Function, ms = 300) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

async function flash(color: number, times: number) {
	if (times > 0) {
		await sleep(200);
		aura.set_all_to_color(color);
		await sleep(200);
		aura.set_all_to_color(0);
		await flash(color, times - 1);
	} else {
		return Promise.resolve();
	}
}

let last_counts = [0, 0, 0, 0];

async function updateLight(e: vscode.DiagnosticChangeEvent) {
	let diag = vscode.languages.getDiagnostics();
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
	//console.log(errors, warnings, infos, other);
	last_counts = [errors, warnings, infos, other];
	if (errors > 0) {
		if (errors <= 10) {
			await flash(aura.rgb_to_color(255, 0, 0), errors);
		} else {
			aura.set_all_to_color(aura.rgb_to_color(255, 0, 0));
			await sleep(2000);
			aura.set_all_to_color(0);
		}
	}
	if (warnings > 0) {
		if (warnings <= 10) {
			await flash(aura.rgb_to_color(255, 128, 0), warnings);
		} else {
			aura.set_all_to_color(aura.rgb_to_color(255, 128, 0));
			await sleep(2000);
			aura.set_all_to_color(0);
		}
	}
	if (infos > 0) {
		if (infos <= 10) {
			await flash(aura.rgb_to_color(30, 30, 255), infos);
		} else {
			aura.set_all_to_color(aura.rgb_to_color(30, 30, 255));
			await sleep(2000);
			aura.set_all_to_color(0);
		}
	}
}