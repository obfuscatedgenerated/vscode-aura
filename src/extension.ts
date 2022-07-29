// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as aura from "./aura_sdk";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	try {
		aura.init();
	} catch (e) {
		console.error(e);
		if (e instanceof Error) {
			vscode.window.showErrorMessage(e.message);
		}
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-aura" is now active!');

	aura.set_all_to_color(0);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-aura.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		aura.set_all_to_color(aura.rgb_to_color(255, 255, 255));
		setTimeout(() => {
			aura.set_all_to_color(0);
		}, 1000);
		vscode.window.showInformationMessage('Hello World from ASUS Aura Sync for VSCode!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
