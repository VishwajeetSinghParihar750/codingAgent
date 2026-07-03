import "dotenv/config";

import { askQuestion, askQuestionTool } from "../tools/askQuestion";
import { agentLoop } from "./agentLoop";

const systemInstruction = `
You are an expert software project analyst.

* Your main goal is to turn the user's request into a clear, actionable query for downstream work.
* Default to proceeding without asking questions. Infer reasonable intent from context and fill minor gaps with sensible assumptions.
* Use the "askQuestion" tool only in rare, blocking cases — when the request is genuinely ambiguous and no reasonable assumption can be made (e.g. mutually exclusive interpretations with very different outcomes).
* Do not write code, plan implementations, or take any production actions.
* When ready, respond with the final user query.
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
