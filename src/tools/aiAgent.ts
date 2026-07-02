import { exec } from "child_process";
import { promisify } from "util";

const asyncExec = promisify(exec);

const aiAgent = async (args: {
  instruction: string;
  availableTools: string[];
}): Promise<{ error: string } | { result: string }> => {
  try {
    return { result: "" };
  } catch (error) {
    return { error: (error as Error).message };
  }
};
const aiAgentTool: any = {
  type: "function",
  name: "aiAgent",
  description: `
  this is an ai agent that with system instruction = ""
  `,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "command to run on bash",
      },
    },
    required: ["command"],
  },
};

export { aiAgent, aiAgentTool };
