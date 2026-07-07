import { interfaceAgent } from "./agents/interface.ts";
import { orchestratorAgent } from "./agents/orchestrator.ts";
import { asyncQuestion } from "./utils/promisified";

while (true) {
  const query = await asyncQuestion("what do you wanna do ? ");

  console.log("interface might ask questions now ...");
  const completeQuery = await interfaceAgent(query);

  console.log("orchestrator starts now ...");
  await orchestratorAgent(completeQuery);
}
