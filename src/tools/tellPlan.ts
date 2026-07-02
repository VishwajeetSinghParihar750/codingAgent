let plan: Map<string, string> = new Map();
const done: Set<string> = new Set();

const tellPlan = (args: { plan: { id: string; task: string }[] }) => {
  plan = new Map();
  done.clear();
  args.plan.forEach((item) => {
    plan.set(item.id, item.task);
  });
  return { done: true };
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
};

export { tellPlan, tellPlanTool, done, plan };
