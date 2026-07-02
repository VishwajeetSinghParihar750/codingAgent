import { agentLoop } from "./agents/interface.ts";
import { asyncQuestion } from "./utils/promisified";

// while (true) {
const query = await asyncQuestion("what do you wanna do ? ");
await agentLoop(query);
// }
