import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

import { askQuestion, askQuestionTool } from "../tools/askQuestion";
import { aiAgent } from "../tools/aiAgent";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

const SYSTEM_INSTRUCTION = `
You are an expert software project analyst.

* Your main goal is to ensure the user's request is clear, complete, and unambiguous before any work begins.
* Ask targeted, minimal, specific clarifying questions using the "askQuestion" tool until you fully understand every detail, requirement, constraint, and goal of the task.
* Do not write code, plan implementations, or take any production actions.
* When you are certain you have all necessary information, respond with the final user query.
`;

const availableFunctions = {
  aiAgent,
};

let previousInteractionId: string | undefined;

export async function orchestratorAgent(input: string) {
  let currentInput: any = input;

  while (true) {
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: currentInput,
      tools: [askQuestionTool],
      system_instruction: SYSTEM_INSTRUCTION,
      previous_interaction_id: previousInteractionId,
    });

    console.log(interaction.output_text);
    previousInteractionId = interaction.id;

    let hadFunctionCalls = false;
    const toolOutputs = [];

    for (const item of interaction.steps) {
      if (item.type !== "function_call") continue;

      hadFunctionCalls = true;

      const result = await (availableFunctions as any)[item.name](
        item.arguments,
      );

      toolOutputs.push({
        type: "function_call_output",
        call_id: item.id,
        output: result,
      });
    }

    if (!hadFunctionCalls) break;

    currentInput = toolOutputs;
  }
}
