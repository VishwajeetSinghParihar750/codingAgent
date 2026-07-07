import { bash } from "../utils/bash";

const listFilesDefinition: any = {
  type: "function",
  name: "listFiles",
  description: `
  list the files in the given absolute directory path
  `,
  parameters: {
    type: "string",
    properties: {
      absoluteDirectoryPath: {
        type: "string",
        description: "directory path to list files from",
      },
    },
    required: ["absoluteDirectoryPath"],
  },
};

const listFilesRun = (args: { absoluteDirectoryPath: string }) =>
  bash({ command: `ls -la "${args.absoluteDirectoryPath}"` });

const listFiles = {
  toolDefinition: listFilesDefinition,
  toolCall: listFilesRun,
};

export { listFiles };
