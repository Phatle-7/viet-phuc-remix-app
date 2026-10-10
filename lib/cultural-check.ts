// ============================================================
// FILE: lib/cultural-check.ts
// ============================================================

import { aiCheckCulture } from './ai';
import { RuleContextInput } from './rule-context';
import { CulturalCheckResult } from './rule-engine';

export type { CulturalCheckResult, RuleContextInput };

export async function checkCulture(
  params: RuleContextInput
): Promise<CulturalCheckResult> {
  return aiCheckCulture(params);
}
