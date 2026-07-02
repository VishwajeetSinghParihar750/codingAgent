import "dotenv/config";

import { askQuestion, askQuestionTool } from "../tools/askQuestion";
import { agentLoop } from "./agentLoop";

const systemInstruction = `
You are an expert software project analyst.

* Your main goal is to ensure the user's request is clear, complete, and unambiguous before any work begins.
* Ask targeted, minimal, specific clarifying questions using the "askQuestion" tool until you fully understand every detail, requirement, constraint, and goal of the task.
* Do not write code, plan implementations, or take any production actions.
* When you are certain you have all necessary information, respond with a the final user query.
`;

const availableFunctions = {
  askQuestion,
};

const tools = [askQuestionTool];

let previousInteractionId: string | undefined;

const interfaceAgent = async (input: string): Promise<string> => {
  const result = await agentLoop({
    systemInstruction,
    input,
    tools,
    availableFunctions,
    previousInteractionId,
    outputStructure: {
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            finalUserQuery: {
              type: "string",
              description: "clear, complete user query",
            },
          },
        },
      },
    },
  });

  return JSON.parse(result!).finalUserQuery;
};

export { interfaceAgent };
