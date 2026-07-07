import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { type AgentIdentity, agentLog } from "./identity";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

type agentLoopArgs = {
  identity: AgentIdentity;
  systemInstruction: string;
  input: string;
  tools: any[];
  availableFunctions: any;
  outputStructure?: any;
  previousInteractionId?: string;
};
export async function agentLoop(
  args: agentLoopArgs,
): Promise<string | undefined> {
  let {
    identity,
    systemInstruction,
    input,
    tools,
    availableFunctions,
    outputStructure,
    previousInteractionId,
  } = args;

  let currentInput: any = input;

  while (true) {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: currentInput,
      tools,
      system_instruction: systemInstruction,
      previous_interaction_id: previousInteractionId,
      ...(outputStructure != undefined && outputStructure),
    });

    previousInteractionId = interaction.id;

    let hadFunctionCalls = false;
    const toolOutputs = [];

    for (const item of interaction.steps) {
      if (item.type !== "function_call") continue;

      hadFunctionCalls = true;

      agentLog(identity, "calling tool:", item.name, "with args:", item.arguments);

      const result = await (availableFunctions as any)[item.name](
        item.arguments,
      );

      toolOutputs.push({
        type: "function_result",
        name: item.name,
        call_id: item.id,
        result,
      });
    }

    if (!hadFunctionCalls) return interaction.output_text;

    currentInput = toolOutputs;
  }
}
