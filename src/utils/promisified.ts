import { createInterface } from "readline";
import { stdin as input, stdout as output } from "process";

const rl = createInterface({ input, output });
const asyncQuestion = async (question: string): Promise<string> => {
  return new Promise((res) => {
    rl.question(question, (answer) => {
      res(answer);
    });
  });
};

export { asyncQuestion };
