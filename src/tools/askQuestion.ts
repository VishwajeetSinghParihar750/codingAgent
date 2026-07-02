import { asyncQuestion } from "../utils/promisified";

const askQuestion = async (args: { question: string }) => {
  const res = await asyncQuestion(args.question + "\n\n > ");

  return res;
};

const askQuestionTool: any = {
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

export { askQuestion, askQuestionTool };
