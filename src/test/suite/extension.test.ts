import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Tests", () => {
	vscode.window.showInformationMessage("Begin tests: extension");
	

	test("Test command: testAura", async () => {
		await vscode.commands.executeCommand("vscode-aura.testAura");
	});

	test("Test command: closeAura", async () => {
		await vscode.commands.executeCommand("vscode-aura.closeAura");
	});
});
