import { orchestratorAgent } from "./agents/orchestrator.ts";
import { asyncQuestion } from "./utils/promisified";

process.on("uncaughtException", (e) => {
  console.error("uncaughtException ", e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  console.error("unhandledRejection ", e);
  process.exit(1);
});

while (true) {
  const query = await asyncQuestion("what do you wanna do ? ");

  console.log("orchestrator starts now ...");
  await orchestratorAgent(query);
}
