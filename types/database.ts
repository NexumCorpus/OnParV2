// This file should be regenerated from Supabase after applying migrations:
//   npx supabase gen types typescript --local > types/database.ts
//
// For now, export a placeholder so imports don't break.
// The actual generated types will replace this after Supabase is connected.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, unknown>
  }
}
