# ASUS Aura Sync for VSCode (vscode-aura)

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/obfuscatedgenerated.vscode-aura) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/d/obfuscatedgenerated.vscode-aura?label=installs) ![Visual Studio Marketplace Rating (Stars)](https://img.shields.io/visual-studio-marketplace/stars/obfuscatedgenerated.vscode-aura)](https://marketplace.visualstudio.com/items?itemName=obfuscatedgenerated.vscode-aura)


Adds ASUS Aura RGB integration to VSCode. (Unofficial, Windows x64 Only)

ASUS Aura Sync® is either a US registered trademark or trademark of ASUSTeK Computer Inc. in the United States and/or other countries.

Reference to any ASUS products, services, processes, or other information and/or use of ASUS Trademarks does not constitute or imply endorsement, sponsorship, or recommendation thereof by ASUS.

NOTE: Sometimes, new VSCode versions update Electron. When this happens, I need to manually recompile the native module. If you get an error about the module version not being correct, please open an issue and I'll get it fixed ASAP. This also drops support for older VSCode versions. If you know of a way I can prebuildify to support all Electron versions, please let me know.

## Features

This extension controls the RGB lights on your devices to indicate the problems found in your code.

## Requirements

- 64-bit Windows Only
- Requires hardware with ASUS Aura Sync® RGB
- Requires ASUS Aura software to be installed
- Requires LightingService.exe from the ASUS Aura software to be running

## Contributes

### Commands

#### Test connection to Aura (`vscode-aura.testAura`)

This command will test the connection to the Aura Sync software. The command will return a message indicating if the connection was successful and the connected devices will display white for a short time.

#### Close connection to Aura (`vscode-aura.closeAura`)

This command will close the connection to the Aura Sync software. This releases control and allows the lights to return to their default behaviour.

### Configuration

<details>
<summary><h4 style="display:inline">Colo(u)rs (<code>vscode-aura.colors</code>)</h4>

This section contains the configuration for the colo(u)rs used to indicate the problems found in your code.
</summary>

##### Colors > Info (`vscode-aura.colors.info`)

This is the colo(u)r used to indicate an info problem.

*Accepts: hex color string*


##### Colors > Warning (`vscode-aura.colors.warning`)

This is the colo(u)r used to indicate an info problem.

*Accepts: hex color string*

##### Colors > Error (`vscode-aura.colors.error`)

This is the colo(u)r used to indicate an info problem.

*Accepts: hex color string*
</details>


<details>
<summary>
<h4 style="display:inline">Timings (<code>vscode-aura.timings</code>)</h4>

This section contains the configuration for the timings used to indicate the problems found in your code.
</summary>

##### Timings > Update Interval (`vscode-aura.timings.updateInterval`)

This is the length in milliseconds to update the problem count.

*Accepts: number >= 0*


##### Timings > Info Blink (`vscode-aura.timings.infoBlink`)

This is the length in milliseconds for each blink when showing info problems.

*Accepts: number >= 0*


##### Timings > Info Hold (`vscode-aura.timings.infoHold`)

This is the length in milliseconds to hold the light when showing info problems over the high threshold.

*Accepts: number >= 0*


##### Timings > Warning Blink (`vscode-aura.timings.warningBlink`)

This is the length in milliseconds for each blink when showing warning problems.

*Accepts: number >= 0*


##### Timings > Warning Hold (`vscode-aura.timings.warningHold`)

This is the length in milliseconds to hold the light when showing warning problems over the high threshold.

*Accepts: number >= 0*


##### Timings > Error Blink (`vscode-aura.timings.errorBlink`)

This is the length in milliseconds for each blink when showing error problems.

*Accepts: number >= 0*


##### Timings > Error Hold (`vscode-aura.timings.errorHold`)

This is the length in milliseconds to hold the light when showing error problems over the high threshold.

*Accepts: number >= 0*
</details>


<details>
<summary>
<h4 style="display:inline">Thresholds (<code>vscode-aura.thresholds</code>)</h4>

This section contains the configuration for the thresholds when indicating the problems found in your code.
</summary>

##### Thresholds > Info Minimum (`vscode-aura.thresholds.infoMinimum`)

This is the minimum number of info problems needed to start blinking.

*Accepts: number >= 1*


##### Thresholds > Info Maximum (`vscode-aura.thresholds.infoMaximum`)

This is the maximum number of info problems needed before the light will hold for some time. **(If it is below the minimum, holding will always happen!)**

*Accepts: number >= 1*


##### Thresholds > Warning Minimum (`vscode-aura.thresholds.warningMinimum`)

This is the minimum number of warning problems needed to start blinking.

*Accepts: number >= 1*


##### Thresholds > Warning Maximum (`vscode-aura.thresholds.warningMaximum`)

This is the maximum number of warning problems needed before the light will hold for some time. **(If it is below the minimum, holding will always happen!)**

*Accepts: number >= 1*


##### Thresholds > Error Minimum (`vscode-aura.thresholds.errorMinimum`)

This is the minimum number of error problems needed to start blinking.

*Accepts: number >= 1*

##### Thresholds > Error Maximum (`vscode-aura.thresholds.errorMaximum`)

This is the maximum number of error problems needed before the light will hold for some time. **(If it is below the minimum, holding will always happen!)**

*Accepts: number >= 1*
</details>


#### Only Visible Files

This setting determines if the extension will only show problems for the currently visible files.

*Accepts: boolean*


## Release Notes

See the [CHANGELOG](CHANGELOG.md) for more information.


### 0.0.8 - "Pocket Dimension"

Update to Electron abi106.

### 0.0.7 - "Read all about it"

Documents commands and configuration in the README.

### 0.0.6 - "Don't be negative!"

No negative numbers in number input fields.

### 0.0.5 - "Configs: Part Deux"

Option to only show problems in visible files.

### 0.0.4 - "Configs: Prelude"

Light behaviour is now configurable.

### 0.0.3 - "Monopoly: Microsoft Edition"

Edited publish rules and manifest to only allow win32-x64

### 0.0.2 - "Time based check"

Uses time based check rather than using diagnostic event.

### 0.0.1 - "Initial Release"

Initial release.
