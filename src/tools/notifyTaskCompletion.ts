import { plan, done, logPlan } from "./tellPlan";

const notifyTaskCompletion = async (args: { taskId: string }) => {
  console.log("called notifyTaskCompletion with : ", args.taskId);

  if (!plan.has(args.taskId)) {
    return { error: "no such taskId in latest plan " };
  }
  done.add(args.taskId);
  logPlan();
  return { done: true };
};
const notifyTaskCompletionTool: any = {
  type: "function",
  name: "notifyTaskCompletion",
  description: `
  call this tool to notify user of the task you accomplished in the task list you provided in tellPlan
  `,

  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "id of the task you accomplished",
        enum: Array.from(plan.keys()),
      },
    },
    required: ["taskId"],
  },
};

export { notifyTaskCompletion, notifyTaskCompletionTool };
