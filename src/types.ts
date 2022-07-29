export interface IAuraSdk {
    SwitchMode(): void,
    Enumerate(device_type: number): IAuraDeviceCollection,
    ReleaseControl(reserved: number): void,
}

export interface IAuraCollection {
    _NewEnum(): unknown,
    Item(index: number): unknown,
    Count: number,
}

export interface IAuraDeviceCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraDevice,
}

export interface IAuraDevice {
    Lights?: IAuraLightCollection,
    Keys?: IAuraKeyCollection,
    Type: number,
    Name: string,
    Width: number,
    Height: number,
    Apply(): void,
}

export interface IAuraLightCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraLight,
}

export interface IAuraKeyCollection extends Omit<IAuraCollection, "Item"> {
    Item(index: number): IAuraKey,
}

export interface IAuraLight {
    Red: number,
    Green: number,
    Blue: number,
    Name: string,
    Color: number,
}

export interface IAuraKey extends IAuraLight {
    Code: number,
    X: number,
    Y: number,
}
