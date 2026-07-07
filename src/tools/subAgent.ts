import { agentLoop } from "../agents/agentLoop";
import {
  subAgentToolsNames,
  subAgentFunctionsMapping,
  subAgentToolsDefinitionsMapping,
} from "../utils/executionToolMapping";

const systemInstruction = `
You are a focused sub-agent that completes tasks delegated by a main agent.

Your job is to act as an abstraction layer: do the work thoroughly using the tools you are given, then return only what the main agent needs to know — the final outcome or a clear error. The main agent must not need to understand how you did the work.

Guidelines:
* Understand the task fully, then execute it end-to-end using your available tools.
* Try your best to complete the job. Retry, adjust your approach, or work around obstacles before giving up.
* Use tools as needed. Do not stop at the first failure if another approach might succeed.
* Do not include intermediate steps, tool call details, reasoning, or partial progress in your response.
* On success, put the concise final answer in "result" and leave "error" empty.
* On failure after exhausting reasonable options, leave "result" empty and put a clear, actionable error message in "error".
* Keep both fields short and directly useful to the main agent.
`;

const subAgentRun = async (args: { tools: string[]; input: string }) => {
  console.log("called subAgent with :", args.input);

  const availableFunctions = args.tools.reduce((toRet, curVal) => {
    toRet[curVal] = (subAgentFunctionsMapping as any)[curVal];
    return toRet;
  }, {} as any);

  const tools = args.tools.map(
    (name) => (subAgentToolsDefinitionsMapping as any)[name],
  );

  const toReturn = await agentLoop({
    systemInstruction,
    input: args.input,
    tools,
    availableFunctions,
    outputStructure: {
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "actionable error message if error",
            },
            result: {
              type: "string",
              description: "concise final answer if success",
            },
          },
        },
      },
    },
  });

  console.log("subAgent with input : ", args.input, " returned : ", toReturn);
  return toReturn;
};

const subAgentDefinition: any = {
  type: "function",
  name: "subAgent",
  description: `
  this is an ai agent with system instruction = "${systemInstruction}", 
  and response format "{ error: string, result: string }"
  `,
  parameters: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "task you want the agent to complete",
      },
      tools: {
        type: "array",
        description: "tools the agent has to complete its job",
        items: {
          type: "string",
          enum: subAgentToolsNames,
        },
      },
    },

    required: ["input", "tools"],
  },
};

const subAgent = {
  toolDefinition: subAgentDefinition,
  toolCall: subAgentRun,
};

export { subAgent };
