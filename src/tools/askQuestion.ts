import { asyncQuestion } from "../utils/promisified";

const askQuestionDefinition: any = {
  type: "function",
  name: "askQuestion",
  description: `
  this will prompt a question to user and you would get what he answers
  `,
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "question you wanna ask user",
      },
    },
    required: ["question"],
  },
};

const askQuestionRun = async (args: { question: string }) => {
  return asyncQuestion(args.question + "\n\n > ");
};

const askQuestion = {
  toolDefinition: askQuestionDefinition,
  toolCall: askQuestionRun,
};

export { askQuestion };
