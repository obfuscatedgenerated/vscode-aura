const winax = require("winax");

import { IAuraSdk, IAuraDeviceCollection, IAuraDevice, IAuraLight, IAuraKey } from "./types";

let aura: IAuraSdk;
let devices: IAuraDeviceCollection;

let ready = false;

export class AuraNotInitError extends Error {
    constructor() {
        super("Aura SDK is not initialized");
    }
};
export class AuraNotFoundError extends Error {
    constructor() {
        super("Aura SDK not found. Please make sure you have Aura installed and LightingService.exe is running.");
    }
};

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

export let get_devices = (): IAuraDeviceCollection | void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    return devices;
};

export let set_all_to_color = (color: number): void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    //for (let dev in devices) {
    for (let i = 0; i < devices.Count; i++) {
        let dev: IAuraDevice = devices.Item(i);
        if (dev.Type === 0x80000 && dev.Keys !== undefined) {
            //for (let key in dev.Keys) {
            for (let j = 0; j < dev.Keys.Count; j++) {
                let key: IAuraKey = dev.Keys.Item(j);
                key.Color = color;
            }
        } else {
            //for (let light in dev.Lights) {
            if (dev.Lights === undefined) {
                console.warn("Device " + dev.Name + " has no lights nor keys");
                continue;
            }
            for (let j = 0; j < dev.Lights.Count; j++) {
                let light: IAuraLight = dev.Lights.Item(j);
                light.Color = color;
            }
            dev.Apply();
        }
    }
};

export let rgb_to_color = (r: number, g: number, b: number): number => {
    return b << 16 | g << 8 | r;
};

export let close = (): void => {
    if (!ready) {
        throw new AuraNotInitError();
    }

    aura.ReleaseControl(0);
    ready = false;
};