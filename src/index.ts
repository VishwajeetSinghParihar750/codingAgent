import { interfaceAgent } from "./agents/interface.ts";
import { orchestratorAgent } from "./agents/orchestrator.ts";
import { asyncQuestion } from "./utils/promisified";

while (true) {
  const query = await asyncQuestion("what do you wanna do ? ");
  const completeQuery = await interfaceAgent(query);
  await orchestratorAgent(completeQuery);
}
