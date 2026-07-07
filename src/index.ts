import { orchestratorAgent } from "./agents/orchestrator.ts";
import { asyncQuestion } from "./utils/promisified";

while (true) {
  const query = await asyncQuestion("what do you wanna do ? ");

  console.log("orchestrator starts now ...");
  await orchestratorAgent(query);
}
