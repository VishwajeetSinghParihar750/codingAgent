import { agentLoop } from "./agent";
import { asyncQuestion } from "./utils/promisified";

// while (true) {
const query = await asyncQuestion("what do you wanna do ? ");
await agentLoop(query);
// }
