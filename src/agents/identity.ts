export type AgentIdentity = {
  name: string;
  label?: string;
};

export function formatAgentIdentity(identity: AgentIdentity): string {
  return identity.label ? `${identity.name}:${identity.label}` : identity.name;
}

export function agentLog(
  identity: AgentIdentity,
  message: string,
  ...args: unknown[]
): void {
  console.log(`[${formatAgentIdentity(identity)}]`, message, ...args);
}

export function childIdentity(
  parent: AgentIdentity,
  child: AgentIdentity,
): AgentIdentity {
  return {
    name: `${parent.name} > ${child.name}`,
    label: child.label,
  };
}
