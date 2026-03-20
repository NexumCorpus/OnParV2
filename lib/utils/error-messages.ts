const ERROR_MAP: Record<string, string> = {
  unauthorized: 'Your session has expired. Please sign in again.',
  not_found: 'The item could not be found. It may have been deleted.',
  PLAN_LIMIT_REACHED: 'You\'ve reached your plan limit. Upgrade to add more items.',
  forbidden: 'You don\'t have permission to perform this action.',
  conflict: 'This item was modified by someone else. Please refresh and try again.',
}

export function getUserFriendlyError(error: string | undefined): string {
  if (!error) return 'An unexpected error occurred. Please try again.'
  return ERROR_MAP[error] ?? 'Something went wrong. Please try again.'
}
