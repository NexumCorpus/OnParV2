// Stub for plan limits — full implementation in Tier 7
// Returns true (no limit) until subscription/plan system is built

export async function canAddInventoryItem(_userId: string): Promise<boolean> {
  return true
}

export async function getInventoryItemLimit(_userId: string): Promise<number> {
  return Infinity
}
