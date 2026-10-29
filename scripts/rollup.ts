import { materializeDailyRollup } from "../src/lib/metrics";
import { ensureDemoData } from "../src/lib/ensure-demo";

ensureDemoData();
const day = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const rollup = materializeDailyRollup(day);
console.log(JSON.stringify({ ok: true, rollup }, null, 2));
