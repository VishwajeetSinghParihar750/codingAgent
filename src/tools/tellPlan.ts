const plan: { id: string; task: string }[] = [];
const done: Set<string> = new Set();

const tellPlan = (args: { plan: { id: string; task: string }[] }) => {
  while (plan.length) plan.shift();
  plan.push(...args.plan);
  logPlanUpdates();
  return { done: true };
};

const logPlanUpdates = () => {
  for (const item of plan)
    console.log(item.id in done ? "[$]" : "[ ]", item.task);
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

export { tellPlan, tellPlanTool, done, logPlanUpdates };
