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
        handoff: {
          type: "object",
          description:
            "Execution handoff returned to the parent agent. The parent will use this information as its working context and may pass parts of it to future subagents. Assume the parent will never see this execution, scratchpad, tool calls, or intermediate reasoning again. Preserve all important context required to continue the work without repeating completed investigation. Optimize for minimizing information loss, not for brevity. The handoff may be a few paragraphs for small tasks or tens of thousands of tokens for very large executions.",

          properties: {
            executionContext: {
              type: "string",
              description:
                "A comprehensive narrative of the execution. Include the objective, important reasoning, approaches explored, major decisions, tradeoffs, significant intermediate conclusions, important failed approaches (only if they affect future work), tool results that matter, relationships between findings, and anything another agent would need to continue from this exact point. There is no preferred length—include as much detail as necessary to avoid losing important context.",
            },

            deliverable: {
              type: "string",
              description:
                "The primary artifact produced during execution. This is the direct output requested by the parent. It may contain markdown, source code, JSON serialized as a string, documentation, configuration, reports, or any other textual artifact. Do not duplicate executionContext unless required for correctness.",
            },

            keyFindings: {
              type: "array",
              description:
                "Atomic discoveries or conclusions that the parent should know. Each finding should be independently understandable and easy to reference. Avoid repeating information already sufficiently covered in executionContext.",

              items: {
                type: "string",
              },
            },

            assumptions: {
              type: "array",
              description:
                "Assumptions made during execution that may influence correctness or future work. Include uncertainties, missing information, inferred behavior, or external dependencies.",

              items: {
                type: "string",
              },
            },

            recommendations: {
              type: "array",
              description:
                "Suggested next actions for the parent agent. These may include additional investigations, validation steps, implementation tasks, optimization opportunities, unresolved questions, or potential subagent tasks.",

              items: {
                type: "string",
              },
            },

            unresolvedItems: {
              type: "array",
              description:
                "Problems, unknowns, ambiguities, blockers, or questions that remain unresolved at the end of execution. Leave empty if the task is fully complete.",

              items: {
                type: "string",
              },
            },

            artifactsProduced: {
              type: "array",
              description:
                "Artifacts created during execution that may be useful later. Include file paths, document names, generated outputs, identifiers, or references that the parent can use.",

              items: {
                type: "string",
              },
            },

            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "Overall confidence that the execution is correct and complete. Lower confidence if conclusions rely on assumptions, incomplete information, or uncertain tool results.",
            },
          },

          required: ["executionContext", "deliverable", "confidence"],
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
            "Candidate long-term memories extracted from this execution. Only include information that would help a future agent perform better. Do NOT include temporary reasoning, scratchpad thoughts, failed attempts (unless they teach a reusable lesson), or information already present in the parent response.",

          properties: {
            candidates: {
              type: "array",
              description:
                "A list of durable memories worth considering for storage. If nothing from this execution is likely to be useful in the future, return an empty array.",

              items: {
                type: "object",

                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "semantic",
                      "episodic",
                      "procedural",
                      "reflection",
                      "planning",
                    ],
                    description:
                      "The kind of memory:\n" +
                      "- semantic: Stable facts that are expected to remain true (e.g. project uses Bun, API endpoint exists).\n" +
                      "- episodic: Significant events or completed work that happened during this execution.\n" +
                      "- procedural: Reusable instructions, workflows, or techniques that another agent could follow.\n" +
                      "- reflection: General lessons, heuristics, or insights learned from the execution.\n" +
                      "- planning: Long-term goals, unfinished work, or future tasks that should be remembered.",
                  },

                  title: {
                    type: "string",
                    description:
                      "A concise 3-10 word title describing the memory. This should make it easy to understand the memory at a glance.",
                  },

                  content: {
                    type: "string",
                    description:
                      "The complete memory in natural language. It should be self-contained so another agent can understand it without seeing this execution.",
                  },

                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description:
                      "How confident you are that this memory is accurate. Use lower confidence if it is inferred, uncertain, or based on assumptions.",
                  },

                  importance: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description:
                      "How valuable this memory is for future executions. High importance should be reserved for durable knowledge that is likely to help across multiple future tasks.",
                  },

                  evidence: {
                    type: "string",
                    description:
                      "Optional explanation of where this memory came from (e.g. repository inspection, tool output, user instruction, successful implementation). Leave empty if unnecessary.",
                  },
                },

                required: [
                  "type",
                  "title",
                  "content",
                  "confidence",
                  "importance",
                ],
              },
            },
          },
        },
      },

      required: ["parent", "tree"],
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
  Response format : ${subAgentResponseSchema.response_format.schema.properties.handoff}
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
