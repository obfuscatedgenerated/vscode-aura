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

	console.log("Congratulations, your extension \"vscode-aura\" is now active!");

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

}

export function deactivate() {
	if (connected) {
		aura.close();
	}
}
