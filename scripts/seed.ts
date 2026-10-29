import { buildSeedEvents } from "../src/lib/seed-data";
import { applyEvent } from "../src/lib/ingest";
import { emptyStore } from "../src/lib/types";
import { resetStore, getStorePath } from "../src/lib/store";
import { materializeDailyRollup } from "../src/lib/metrics";

function main() {
  const events = buildSeedEvents();
  let store = emptyStore();
  for (const event of events) {
    store = applyEvent(store, event);
  }
  resetStore(store);
  const rollup = materializeDailyRollup("2026-10-28");
  console.log(
    JSON.stringify(
      {
        ok: true,
        storePath: getStorePath(),
        events: events.length,
        los: store.loanOriginators.length,
        aes: store.accountExecutives.length,
        matches: store.matches.length,
        opportunities: store.opportunities.length,
        outreachAttempts: store.outreachAttempts.length,
        botRuns: store.botRuns.length,
        rollup,
      },
      null,
      2,
    ),
  );
}

main();
