import { agentLoop } from "../agents/agentLoop";
import { agentLog } from "../agents/identity";
import {
  subAgentToolsNames,
  subAgentFunctionsMapping,
  subAgentToolsDefinitionsMapping,
} from "../utils/executionToolMapping";

const subAgentResponseSchema = {
  response_format: {
    type: "text",
    mime_type: "application/json",
    schema: {
      type: "object",
      properties: {
        parent: {
          type: "object",
          description:
            "Information returned to the parent agent so it can continue execution.",

          properties: {
            summary: {
              type: "string",
              description:
                "Brief summary (100-300 tokens) of what was accomplished.",
            },

            deliverable: {
              type: "string",
              description:
                "The primary output requested by the parent. Can contain markdown, code, JSON serialized as string, or any textual artifact.",
            },

            keyFindings: {
              type: "array",
              items: { type: "string" },
              description: "Important discoveries the parent should know.",
            },

            assumptions: {
              type: "array",
              items: { type: "string" },
            },

            recommendations: {
              type: "array",
              items: { type: "string" },
              description: "Suggested next tasks or follow-up investigations.",
            },

            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
          },

          required: [
            "summary",
            "deliverable",
            "keyFindings",
            "assumptions",
            "recommendations",
            "confidence",
          ],
        },

        tree: {
          type: "object",
          description: "Minimal metadata used to update the execution tree.",

          properties: {
            title: {
              type: "string",
            },

            status: {
              type: "string",
              enum: ["completed", "partial", "failed"],
            },

            tags: {
              type: "array",
              items: {
                type: "string",
              },
            },

            artifacts: {
              type: "array",
              items: {
                type: "string",
              },
              description: "IDs of produced artifacts.",
            },

            childTasksSuggested: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "title",
            "status",
            "tags",
            "artifacts",
            "childTasksSuggested",
          ],
        },

        memory: {
          type: "object",
          description:
            "Information to store in execution memory for future retrieval.",

          properties: {
            shouldStore: {
              type: "boolean",
            },

            importance: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },

            searchableSummary: {
              type: "string",
              description: "Compact retrieval-oriented summary.",
            },

            findings: {
              type: "array",
              items: {
                type: "string",
              },
            },

            keywords: {
              type: "array",
              items: {
                type: "string",
              },
            },

            concepts: {
              type: "array",
              items: {
                type: "string",
              },
            },

            assumptions: {
              type: "array",
              items: {
                type: "string",
              },
            },

            decisions: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "shouldStore",
            "importance",
            "searchableSummary",
            "findings",
            "keywords",
            "concepts",
            "assumptions",
            "decisions",
          ],
        },
      },

      required: ["parent", "tree", "memory"],
    },
  },
};

let subAgentId = 0;
const subAgentRun = async (args: {
  tools: string[];
  input: string;
  systemInstruction: string;
}) => {
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

  const response = await agentLoop({
    identity,
    systemInstruction: args.systemInstruction,
    chat,
    tools,
    availableFunctions,
    outputStructure: subAgentResponseSchema,
  });

  const parsedResponse = JSON.parse(response!);

  agentLog(identity, "returned:", parsedResponse);
  return parsedResponse.parent;
};

const subAgentDefinition: any = {
  type: "function",
  name: "subAgent",
  description: `
  Spawn a focused sub-agent to complete a delegated task using the tools you assign.
  Use this for non-trivial work that needs investigation, multiple tool calls, or substantial reasoning.
  Do not use for small tasks you can finish yourself in a few steps.
  Response format : ${subAgentResponseSchema.response_format.schema.properties.parent}
  `,
  parameters: {
    type: "object",
    properties: {
      systemInstruction: {
        type: "string",
        description:
          "Role and behavior for the sub-agent: objective, constraints, expected output, and how to use its tools. Must be self-contained because the sub-agent does not see orchestrator context.",
      },
      input: {
        type: "string",
        description:
          "The task for the sub-agent: one clear objective plus all context it needs to finish independently (relevant paths, prior findings, constraints, and expected deliverable).",
      },
      tools: {
        type: "array",
        description:
          "Execution tools the sub-agent may call. Grant only what is needed for this task.",
        items: {
          type: "string",
          enum: subAgentToolsNames,
        },
      },
    },

    required: ["input", "tools", "systemInstruction"],
  },
};

const subAgent = {
  toolDefinition: subAgentDefinition,
  toolCall: subAgentRun,
};

export { subAgent };
