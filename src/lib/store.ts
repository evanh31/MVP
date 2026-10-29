import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { emptyStore, type HubStore } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "hub.json");

declare global {
  var __lendzHubStore: HubStore | undefined;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadStore(): HubStore {
  if (globalThis.__lendzHubStore) {
    return globalThis.__lendzHubStore;
  }

  ensureDir();
  if (existsSync(STORE_PATH)) {
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as HubStore;
    globalThis.__lendzHubStore = parsed;
    return parsed;
  }

  const store = emptyStore();
  globalThis.__lendzHubStore = store;
  return store;
}

export function saveStore(store: HubStore): void {
  ensureDir();
  globalThis.__lendzHubStore = store;
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function resetStore(store: HubStore): HubStore {
  saveStore(store);
  return store;
}

export function getStorePath(): string {
  return STORE_PATH;
}
