import { exec } from "child_process";
import { promisify } from "util";

const asyncExec = promisify(exec);

const bash = async (args: {
  command: string;
}): Promise<{ stderr: string; stdout: string } | { error: string }> => {
  try {
    let res = await asyncExec(args.command);
    return res;
  } catch (error) {
    return { error: (error as Error).message };
  }
};
const bashTool: any = {
  type: "function",
  name: "bash",
  description: `GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
  returns {stderr : string, stdout : string} | {error : string}
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
  strict: true,
};

export { bash, bashTool };
