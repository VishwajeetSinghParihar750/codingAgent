import { plan, done } from "./tellPlan";

const notifyTaskCompletion = async (args: { taskId: string }) => {
  if (!plan.has(args.taskId)) {
    return { error: "no such taskId in latest plan " };
  }
  done.add(args.taskId);
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
