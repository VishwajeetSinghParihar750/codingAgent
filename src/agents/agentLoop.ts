import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { type AgentIdentity, agentLog } from "./identity";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

type agentLoopArgs = {
  identity: AgentIdentity;
  systemInstruction: string;
  chat: any[];
  tools: any[];
  availableFunctions: any;
  outputStructure?: any;
};

export async function agentLoop(
  args: agentLoopArgs,
): Promise<string | undefined> {
  const {
    identity,
    systemInstruction,
    chat,
    tools,
    availableFunctions,
    outputStructure,
  } = args;

  while (true) {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: chat,
      store: false,
      tools,
      system_instruction: systemInstruction,
      ...(outputStructure != undefined && outputStructure),
    });

    chat.push(...interaction.steps);

    let hadFunctionCalls = false;
    const toolOutputs = [];

    for (const item of interaction.steps) {
      if (item.type !== "function_call") continue;

      hadFunctionCalls = true;

      agentLog(
        identity,
        "calling tool:",
        item.name,
        "with args:",
        item.arguments,
      );

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

    const tokensUsed = interaction.usage?.total_tokens;
    if (tokensUsed != undefined) {
      // maybe summarize / compaction
      //
    }

    if (!hadFunctionCalls) {
      return interaction.output_text;
    }

    chat.push(...toolOutputs);
  }
}
