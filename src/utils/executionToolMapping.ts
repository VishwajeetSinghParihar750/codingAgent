import { listFiles } from "../tools/listFiles";
import { editFile } from "../tools/editFile";
import { writeFile } from "../tools/writeFile";
import { readFile } from "../tools/readFile";
import { searchCode } from "../tools/searchCode";

const executionTools = {
  listFiles,
  editFile,
  writeFile,
  readFile,
  searchCode,
} as const;

const subAgentToolsNames = Object.keys(executionTools);

const subAgentFunctionsMapping = Object.fromEntries(
  Object.entries(executionTools).map(([name, tool]) => [name, tool.toolCall]),
);

const subAgentToolsDefinitionsMapping = Object.fromEntries(
  Object.entries(executionTools).map(([name, tool]) => [
    name,
    tool.toolDefinition,
  ]),
);

export {
  executionTools,
  subAgentToolsNames,
  subAgentFunctionsMapping,
  subAgentToolsDefinitionsMapping,
};
