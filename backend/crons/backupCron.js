import cron from "node-cron";
import { runBackup } from "../services/backupService.js";

// Every Sunday 2 AM
// cron.schedule("0 2 * * 0", async () => {
//     console.log("Starting weekly backup...");
//     await runBackup();
// });
// await runBackup();