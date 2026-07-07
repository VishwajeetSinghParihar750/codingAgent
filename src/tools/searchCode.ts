import { bash } from "../utils/bash";

const searchCodeDefinition: any = {
  type: "function",
  name: "searchCode",
  description: `
  on bash runs => \`rg --color never -"\${args.options ? "-n" + args.options : "-n"}" "\${args.pattern}" "\${args.absoluteDirectoryPath ?? ''}"\`
  `,
  parameters: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "pattern to search",
      },
      options: {
        type: "string",
        description:
          "Short ripgrep flags without the leading '-'. Examples: 'F' (literal), 'i' (ignore case), 'g' (glob), 'Fi' (literal + ignore case). Line numbers (-n) are always enabled.",
      },
      absoluteDirectoryPath: {
        type: "string",
        description: "directory path to search pattern in",
      },
    },
    required: ["pattern"],
  },
};

const searchCodeRun = (args: {
  pattern: string;
  absoluteDirectoryPath?: string;
  options?: string;
}) =>
  bash({
    command: `rg ${args.options ? "-n" + args.options : "-n"} "${args.pattern}" "${args.absoluteDirectoryPath ?? ""}" `,
  });

const searchCode = {
  toolDefinition: searchCodeDefinition,
  toolCall: searchCodeRun,
};

export { searchCode };
