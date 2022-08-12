import * as path from 'path';

import { runTests } from '@vscode/test-electron';

const winax = require("winax");

async function main() {
	if(process.arch !== "x64" || process.platform !== "win32") {
		console.error("Tests only run on 64-bit Windows.");
		process.exit(1);
	}

	try {
		let test_aura = new winax.Object("aura.sdk.1");
		winax.release(test_aura);
	} catch (e) {
		if (e instanceof Error && e.message.includes("Invalid class string")) {
			console.error("Tests require Aura installed.");
			process.exit(1);
		} else {
			throw e;
		}
	}
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
