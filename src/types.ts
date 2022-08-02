// GENERIC TYPES



// AURA SDK TYPES

export interface IAuraSdk {
    SwitchMode(): void,
    Enumerate(device_type: number): IAuraSyncDeviceCollection,
    ReleaseControl(reserved: number): void,
}

export interface IAuraCollection {
    _NewEnum(): unknown,
    Item(index: number): unknown,
    Count: number,
}

export interface IAuraSyncDeviceCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraSyncDevice,
}

export interface IAuraSyncDevice {
    Lights: IAuraRgbLightCollection,
    Type: number,
    Name: string,
    Width: number,
    Height: number,
    Apply(): void,
}

export interface IAuraSyncKeyboard extends IAuraSyncDevice {
    Keys: IAuraRgbKeyCollection,
    Key(): IAuraRgbKey,
}

export interface IAuraRgbLightCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraRgbLight,
}

export interface IAuraRgbKeyCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraRgbKey,
}

export interface IAuraRgbLight {
    Red: number,
    Green: number,
    Blue: number,
    Name: string,
    Color: number,
}

export interface IAuraRgbKey extends IAuraRgbLight {
    Code: number,
    X: number,
    Y: number,
}


// CONFIGURATION TYPES

export interface IColorConfig {
    info: string,
    warning: string,
    error: string,
}
