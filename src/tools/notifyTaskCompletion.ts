const notifyTaskCompletion = async (
  args: {
    taskId: string;
  },
  sendResponse: any,
) => {
  sendResponse({ payload: args.taskId, type: "taskCompleted" });
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
      },
    },
    required: ["taskId"],
  },
  strict: true,
};

export { notifyTaskCompletion, notifyTaskCompletionTool };
