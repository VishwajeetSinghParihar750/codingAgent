import { bash } from "../utils/bash";

const writeFileDefinition: any = {
  type: "function",
  name: "writeFile",
  description: `
  on bash runs => \`echo \${args.content} > \${args.absoluteFilePath}\`
  `,
  parameters: {
    type: "object",
    properties: {
      absoluteFilePath: {
        type: "string",
        description: "file path to write contents at",
      },
      content: {
        type: "string",
        description: "content to write in file",
      },
    },
    required: ["absoluteFilePath", "content"],
  },
};

const writeFileRun = (args: { absoluteFilePath: string; content: string }) =>
  bash({ command: `echo ${args.content} > ${args.absoluteFilePath}` });

const writeFile = {
  toolDefinition: writeFileDefinition,
  toolCall: writeFileRun,
};

export { writeFile };
