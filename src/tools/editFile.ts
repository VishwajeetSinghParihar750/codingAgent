import { bash } from "../utils/bash";

const editFileDefinition: any = {
  type: "function",
  name: "editFile",
  description: `
  on bash runs => \`sed -\${args.options ?? "i"} \${args.substitutionCommand} \${args.absoluteFilePath}\` 
  `,
  parameters: {
    type: "object",
    properties: {
      absoluteFilePath: {
        type: "string",
        description: "absoluteFilePath for sed",
      },
      substitutionCommand: {
        type: "string",
        description: "substitutionCommand for sed",
      },
      options: {
        type: "string",
        description:
          "Short sed flags without the leading '-'. Examples: 'i', 'zi', 'n'.",
      },
    },
    required: ["absoluteFilePath", "substitutionCommand"],
  },
};

const editFileRun = (args: {
  absoluteFilePath: string;
  substitutionCommand: string;
  options?: string;
}) =>
  bash({
    command: `sed -${args.options ?? "i"} "${args.substitutionCommand}" "${args.absoluteFilePath}"`,
  });

const editFile = {
  toolDefinition: editFileDefinition,
  toolCall: editFileRun,
};

export { editFile };
