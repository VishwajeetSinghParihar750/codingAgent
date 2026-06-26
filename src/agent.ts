import "dotenv/config";
import OpenAI from "openai";
import { bash, bashTool } from "./tools/bash";
import { tellPlan, tellPlanTool } from "./tools/tellPlan";
import {
  notifyTaskCompletion,
  notifyTaskCompletionTool,
} from "./tools/notifyTaskCompletion";
import { askQuestion, askQuestionTool } from "./tools/askQuestion";

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.GEMINI_KEY!,
});

const SYSTEM_INSTRUCTION = `
  You are a senior software engineer.

* Implement whatever the user asks.
* Before starting, break the work into sequential tasks with unique IDs and call "tellPlan".
* Complete the tasks one by one.
* After finishing each task, immediately call "notifyTaskCompletion" with that task's ID.
* Before ending, ensure every task from "tellPlan" has a matching "notifyTaskCompletion" call.
* You may modify only the project specified by the user.
* If the user asks for a new project, create it only inside "~/codingAgentProjects".
* Never create or modify files outside the target project unless the user explicitly instructs you to.
* Write production-quality, maintainable code and ask for clarification only when essential.
  `;

let previousId: any = undefined;
let aiResponse: any = undefined;

const availableFunctions = {
  bash,
  notifyTaskCompletion,
  tellPlan,
  askQuestion,
};

const context = [];

const agentLoop = async (input: string) => {
  console.log("agentLoop input ", input);

  context.push({ role: "user", content: input });

  while (true) {
    aiResponse = await ai.responses.create({
      model: "gemini-3.5-flash",
      input,
      tools: [
        bashTool,
        tellPlanTool,
        notifyTaskCompletionTool,
        askQuestionTool,
      ],
      instructions: SYSTEM_INSTRUCTION,
      stream: true,
    });

    let hadFunctionCalls = false;
    for (const item of aiResponse.output) {
      if (item.type === "function_call") {
        hadFunctionCalls = true;

        const result = await ((availableFunctions as any)[item.name] as any)(
          JSON.parse(item.arguments),
        );

        console.log(
          `Called ${item.name}(${JSON.stringify(item.arguments)}) →`,
          result,
        );

        context.push({
          type: "function_call_output",
          call_id: item.id,
          output: result,
        });
      }
    }

    console.log(aiResponse.output_text);

    if (!hadFunctionCalls) break;
  }
};

export { agentLoop };
