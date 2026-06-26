const tellPlan = (
  args: { plan: { id: string; task: string }[] },
  sendResponse: any,
) => {
  sendResponse({ type: "plan", payload: args.plan });
};
const tellPlanTool: any = {
  type: "function",
  name: "tellPlan",
  description: `
  if user's response will take long call this tool to notify user of the checklist of plan you
  made to acccomplish user's current query
  `,
  parameters: {
    type: "object",
    properties: {
      plan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            task: {
              type: "string",
            },
          },
        },
        description: "simple checklist of plan you would follow",
      },
    },
    required: ["plan"],
  },
  strict: true,
};

export { tellPlan, tellPlanTool };
