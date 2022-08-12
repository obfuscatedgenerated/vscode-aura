const winax = require("winax");

import { IAuraSdk, IAuraSyncDeviceCollection, IAuraSyncDevice, IAuraSyncKeyboard, IAuraRgbLight, IAuraRgbKey } from "./types";

let aura: IAuraSdk;
let devices: IAuraSyncDeviceCollection;

let ready = false;

/**
 * Error fired when the Aura SDK is not ready.
 * @date 31/07/2022 - 00:10:01
 *
 * @export
 * @class AuraNotInitError
 * @typedef {AuraNotInitError}
 * @extends {Error}
 */
export class AuraNotInitError extends Error {
    /**
     * Creates an instance of AuraNotInitError.
     * @date 31/07/2022 - 00:10:01
     *
     * @constructor
     */
    constructor() {
        super("Aura SDK is not initialized");
    }
};
/**
 * Error fired when the Aura SDK isn't available on the device.
 * @date 31/07/2022 - 00:10:01
 *
 * @export
 * @class AuraNotFoundError
 * @typedef {AuraNotFoundError}
 * @extends {Error}
 */
export class AuraNotFoundError extends Error {
    /**
     * Creates an instance of AuraNotFoundError.
     * @date 31/07/2022 - 00:10:01
     *
     * @constructor
     */
    constructor() {
        super("Aura SDK not found. Please make sure you have Aura installed and LightingService.exe is running.");
    }
};

/**
 * Initializes the Aura SDK.
 * @date 31/07/2022 - 00:10:01
 */
export let init = (): void => {
    if (ready) {
        console.warn("Aura SDK is already initialized");
        return;
    }

    try {
        aura = new winax.Object("aura.sdk.1");
    } catch (e) {
        if (e instanceof Error && e.message.includes("Invalid class string")) {
            throw new AuraNotFoundError();
        } else {
            throw e;
        }
    }

    aura.SwitchMode();
    devices = aura.Enumerate(0);
    ready = true;
};

/**
 * Lists all Aura devices.
 * @date 31/07/2022 - 00:10:01
 *
 * @returns {(IAuraSyncDeviceCollection | void)}
 */
export let get_devices = (): IAuraSyncDeviceCollection | void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    return devices;
};

/**
 * Sets all Aura devices to the given (hexadecimal) color.
 * @date 31/07/2022 - 00:10:01
 *
 * @param {number} color
 */
export let set_all_to_color = (color: number): void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    //for (let dev in devices) {
    for (let i = 0; i < devices.Count; i++) {
        let dev: IAuraSyncDevice = devices.Item(i);
        if (dev.Type === 0x80000) {
            let kb = dev as IAuraSyncKeyboard;
            //for (let key in dev.Keys) {
            for (let j = 0; j < kb.Keys.Count; j++) {
                let key: IAuraRgbKey = kb.Keys.Item(j);
                key.Color = color;
            }
        } else {
            //for (let light in dev.Lights) {
            if (dev.Lights === undefined) {
                console.warn("Device " + dev.Name + " has no lights nor keys");
                continue;
            }
            for (let j = 0; j < dev.Lights.Count; j++) {
                let light: IAuraRgbLight = dev.Lights.Item(j);
                light.Color = color;
            }
            dev.Apply();
        }
    }
};

/**
 * Converts RGB values to a hexadecimal color number.
 * @date 31/07/2022 - 00:10:01
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export let rgb_to_color = (r: number, g: number, b: number): number => {
    return b << 16 | g << 8 | r;
};

/**
 * Releases control of all Aura devices.
 * @date 31/07/2022 - 00:10:01
 */
export let close = (): void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    ready = false;
    aura.ReleaseControl(0);
    winax.release(aura);
};