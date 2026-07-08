import { agentLoop } from "../agents/agentLoop";
import { agentLog } from "../agents/identity";
import {
  subAgentToolsNames,
  subAgentFunctionsMapping,
  subAgentToolsDefinitionsMapping,
} from "../utils/executionToolMapping";

const systemInstruction = `
You are an execution sub-agent.

You are given one well-defined objective by the orchestrator.

Your responsibility is to complete that objective as thoroughly as possible using the tools available to you.

You do not coordinate work.
You do not create plans.
You do not delegate work.
You do not ask the orchestrator what to do next.
You execute.

## Responsibilities

- Fully understand the assigned objective.
- Use the available tools to complete it.
- Adapt when a tool or approach fails.
- Verify your work whenever practical.
- Continue until the objective is completed or no reasonable path remains.

## Execution

Prefer solving the actual problem over blindly following an initial approach.

If a tool fails:
- understand why
- try another approach
- retry when appropriate
- only give up after reasonable alternatives have been exhausted

Do not stop because the first attempt failed.

## Scope

Stay within the assigned objective.

Do not expand the task.

Do not make unrelated improvements.

If additional work is required outside your objective, report it instead of attempting it.

## Communication

The orchestrator only needs the outcome.

Do not explain:
- internal reasoning
- tool usage
- failed attempts
- intermediate progress

Return only:
- result: the useful final outcome
- error: an actionable explanation if the objective could not be completed

Exactly one of result or error should be non-empty.

## General

Never fabricate results.

Never claim success unless you completed the objective.

If success is partial but the requested objective is not complete, treat it as a failure and explain what prevented completion.
`;

let subAgentId = 0;
const subAgentRun = async (args: { tools: string[]; input: string }) => {
  const identity = {
    name: "subAgent" + subAgentId++,
    label: args.input.slice(0, 60),
  };

  agentLog(identity, "started with input:", args.input);

  const availableFunctions = args.tools.reduce((toRet, curVal) => {
    toRet[curVal] = (subAgentFunctionsMapping as any)[curVal];
    return toRet;
  }, {} as any);

  const tools = args.tools.map(
    (name) => (subAgentToolsDefinitionsMapping as any)[name],
  );

  const chat = [
    {
      type: "user_input",
      content: [{ type: "text", text: args.input }],
    },
  ];

  const toReturn = await agentLoop({
    identity,
    systemInstruction,
    chat,
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

  agentLog(identity, "returned:", toReturn);
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
        description: `
A self-contained task description.

Write this as if assigning work to a capable engineer who has no other context.

The assignment should contain:
- Objective: what needs to be accomplished.
- Context: all information required to understand the task.
- Constraints: important requirements or things to avoid.
- Success criteria: what constitutes successful completion.

Do not assume the sub-agent knows anything that is not included here.
`,
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
