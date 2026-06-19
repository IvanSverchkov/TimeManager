import type { State } from "./types";

export abstract class LocalStorageState<T extends { [key: string]: unknown }> implements State {
  public get(key: keyof T): T | null {
    if (typeof key !== "string") throw new Error("Wrong key");

    const value = localStorage.getItem(key);
    
    if (value == null) {
      return null;
    }

    return JSON.parse(value);
  }

  public set(key: string, value: T) {
    if (value == null) {
      console.error(`[LocalStoreDatabase.set] Unexpected value: ${value}`);
    }

    localStorage.setItem(key, JSON.stringify(value));
  }
}
