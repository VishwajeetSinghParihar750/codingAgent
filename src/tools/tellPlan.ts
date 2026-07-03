const plan: Map<string, string> = new Map();
const done: Set<string> = new Set();

const tellPlanRun = (args: { plan: { id: string; task: string }[] }) => {
  console.log("called tell plan with : ", args.plan);

  plan.clear();
  done.clear();

  args.plan.forEach((item) => {
    plan.set(item.id, item.task);
  });

  logPlan();
  return { done: true };
};

const logPlan = () => {
  for (let [id, task] of plan.entries()) {
    console.log(done.has(id) ? "[-]" : "[ ]", " ", task);
  }
};

const tellPlanDefinition: any = {
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

const tellPlan = {
  toolDefinition: tellPlanDefinition,
  toolCall: tellPlanRun,
};

export { tellPlan, done, plan, logPlan };
