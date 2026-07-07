import { bash } from "../utils/bash";

const readFileDefinition: any = {
  type: "function",
  name: "readFile",
  description: `
  on bash runs => \`cat "\${args.absoluteFilePath}"\`
  `,
  parameters: {
    type: "object",
    properties: {
      absoluteFilePath: {
        type: "string",
        description: "file path to read contents of",
      },
    },
    required: ["absoluteFilePath"],
  },
};

const readFileRun = (args: { absoluteFilePath: string }) =>
  bash({ command: `cat "${args.absoluteFilePath}"` });

const readFile = {
  toolDefinition: readFileDefinition,
  toolCall: readFileRun,
};

export { readFile };
