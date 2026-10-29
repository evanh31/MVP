import { applyEvent } from "./ingest";
import { materializeDailyRollup } from "./metrics";
import { buildSeedEvents } from "./seed-data";
import { loadStore, resetStore } from "./store";
import { emptyStore } from "./types";

let seededThisProcess = false;

/** Ensure demo data exists so `npm run dev` shows a populated hub. */
export function ensureDemoData(): void {
  const store = loadStore();
  if (store.events.length > 0 || seededThisProcess) {
    return;
  }

  seededThisProcess = true;
  const events = buildSeedEvents();
  let next = emptyStore();
  for (const event of events) {
    next = applyEvent(next, event);
  }
  resetStore(next);
  materializeDailyRollup("2026-10-28");
}
