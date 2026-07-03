import "dotenv/config";
import OpenAI from "openai";
import { bash, bashTool } from "./utils/bash";
import { tellPlan } from "./tools/tellPlan";
import { notifyTaskCompletion } from "./tools/notifyTaskCompletion";
import { askQuestion } from "./tools/askQuestion";

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_KEY!,
});

const SYSTEM_INSTRUCTION = `
  You are an expert software project analyst.
  
* Your main goal is to ensure the user's request is clear, complete, and unambiguous before any work begins.
* Ask targeted, minimal, specific clarifying questions using the "askQuestion" tool until you fully understand every detail, requirement, constraint, and goal of the task.
* Do not write code, plan implementations, or take any production actions. Only focus on understanding and clarifying the task.
* When you are certain you have all necessary information (no ambiguities or uncertainties remain), respond with a summary of the clarified task that is ready to be forwarded to an implementation agent.
* Never assume details that are not stated; always ask if unsure.
* Keep all clarifications relevant to the user's project and respect any boundaries or constraints they specify.
  `;

const availableFunctions = {
  bash,
  notifyTaskCompletion: notifyTaskCompletion.toolCall,
  tellPlan: tellPlan.toolCall,
  askQuestion: askQuestion.toolCall,
};

const context = [];

const agentLoop = async (input: string) => {
  context.push({ role: "user", content: input });

  while (true) {
    console.log(1);
    let aiResponse = await ai.responses.create({
      model: "gemini-2.5-flash-lite",
      input,
      tools: [
        bashTool,
        tellPlan.toolDefinition,
        notifyTaskCompletion.toolDefinition,
        askQuestion.toolDefinition,
      ],
      instructions: SYSTEM_INSTRUCTION,
      // stream: true,
    });

    console.log(2);
    let hadFunctionCalls = false;
    for (const item of aiResponse.output) {
      console.log(3);
      if (item.type === "function_call") {
        hadFunctionCalls = true;

        console.log(`Called ${item.name}(${JSON.stringify(item.arguments)}) →`);

        const result = await ((availableFunctions as any)[item.name] as any)(
          JSON.parse(item.arguments),
        );

        console.log(`result : `, result);

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
  console.log(4);
};

export { agentLoop };
