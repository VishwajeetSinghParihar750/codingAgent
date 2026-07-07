import { askQuestion } from "../tools/askQuestion";
import { tellPlan } from "../tools/tellPlan";
import { notifyTaskCompletion } from "../tools/notifyTaskCompletion";
import { subAgent } from "../tools/subAgent";
import { executionTools } from "./executionToolMapping";

const orchestrationTools = {
  askQuestion,
  tellPlan,
  notifyTaskCompletion,
  subAgent,
};

const allTools = { ...orchestrationTools, ...executionTools };

const availableToolsNames = Object.keys(allTools);

const availableFunctionsMapping = Object.fromEntries(
  Object.entries(allTools).map(([name, tool]) => [name, tool.toolCall]),
);

const availableToolsMapping = Object.fromEntries(
  Object.entries(allTools).map(([name, tool]) => [name, tool.toolDefinition]),
);

const tools = Object.values(allTools).map((tool) => tool.toolDefinition);

export {
  tools,
  availableToolsNames,
  availableFunctionsMapping,
  availableToolsMapping,
};
