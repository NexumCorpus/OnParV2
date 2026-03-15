'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function submitFeedback(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Map form subject labels to feedback_type CHECK constraint values:
  // 'General' -> 'general', 'Bug' -> 'bug', 'Feature' -> 'feature_request'
  const subjectMap: Record<string, string> = {
    general: 'general',
    bug: 'bug',
    feature: 'feature_request',
  }
  const rawSubject = ((formData.get('subject') as string) || 'general').toLowerCase()
  const feedbackType = subjectMap[rawSubject] ?? 'general'

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    email: formData.get('email') as string,
    feedback_type: feedbackType,
    message: formData.get('message') as string,
    page_url: '/contact',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
