import type { ObjToString } from "./types.js";

type DataReturn<T> = T extends true ? "" : T extends false ? undefined : T;

export function dataAttr<T>(value: T): DataReturn<T> {
	return (value === true ? "" : value === false ? undefined : value) as DataReturn<T>;
}

type DisabledReturn<T> = T extends true ? true : undefined;
export function disabledAttr<V extends boolean>(value?: V): DisabledReturn<V> {
	return (value === true ? true : undefined) as DisabledReturn<V>;
}

export function styleAttr<T extends Record<string, string>>(value: T): ObjToString<T> {
	return Object.entries(value)
		.map(([key, value]) => `${key}: ${value};`)
		.join(" ") as ObjToString<T>;
}
