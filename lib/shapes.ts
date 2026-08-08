/**
 * What the user came to this system to *do*. This is the axis that cuts across
 * employer: a permit engine and an internal approvals tool are the same problem
 * whether or not a government paid for one of them. The government/independent
 * split answers "who hired you"; this answers "have you solved my problem".
 *
 * Lives apart from lib/content.ts so client components can import the vocabulary
 * without pulling in the filesystem reader.
 */
export type ProblemShape = 'workflow' | 'data' | 'explainer' | 'tool' | 'game';

export const PROBLEM_SHAPES: ProblemShape[] = ['workflow', 'data', 'explainer', 'tool', 'game'];

export function isProblemShape(value: string): value is ProblemShape {
  return (PROBLEM_SHAPES as string[]).includes(value);
}
