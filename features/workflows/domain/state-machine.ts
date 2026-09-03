export type StateMachine<State extends string> = Readonly<Record<State, readonly State[]>>;

export class InvalidStateTransitionError extends Error {
  constructor(
    readonly current: string,
    readonly next: string,
  ) {
    super(`Transition from ${current} to ${next} is not allowed.`);
    this.name = "InvalidStateTransitionError";
  }
}

export function canTransition<State extends string>(
  machine: StateMachine<State>,
  current: State,
  next: State,
): boolean {
  return machine[current].includes(next);
}

export function assertTransition<State extends string>(
  machine: StateMachine<State>,
  current: State,
  next: State,
): void {
  if (!canTransition(machine, current, next)) {
    throw new InvalidStateTransitionError(current, next);
  }
}

export function allowedTransitions<State extends string>(
  machine: StateMachine<State>,
  current: State,
): readonly State[] {
  return machine[current];
}
