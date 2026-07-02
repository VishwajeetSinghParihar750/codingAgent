import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

let previousInteractionId: string | undefined;

export async function interfaceAgent(
  systemInstruction: string,
  input: string,
  tools: any[],
  availableFunctions: any,
) {
  let currentInput: any = input;

  while (true) {
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: currentInput,
      tools,
      system_instruction: systemInstruction,
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
