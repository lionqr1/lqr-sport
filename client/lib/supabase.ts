import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on the HTML structure
export interface Channel {
  id: number;
  name: string;
  stream_url: string;
  logo_url?: string;
  created_at: string;
}

export interface LiveTV {
  id: number;
  name: string;
  stream_url: string;
  logo_url?: string;
  created_at: string;
}

export interface Radio {
  id: number;
  title: string;
  live_url: string;
  created_at: string;
}

export interface Update {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface League {
  id: number;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  match_time: string;
  created_at: string;
}

export type SourceType = "channel" | "stream";

export interface MatchSource {
  id: number;
  match_id: number;
  source_type: SourceType;
  source_id: string | number;
  label?: string;
  created_at: string;
}

export interface Message {
  id: number;
  email: string;
  content: string;
  created_at: string;
}
