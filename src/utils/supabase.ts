// Supabase 客户端 + 学习进度云同步
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { getStorage, setStorage } from './storage';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export async function currentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

// 收集本地学习进度为一个对象
export function collectProgress(): Record<string, unknown> {
  return {
    fsrs_card_states: getStorage('fsrs_card_states', {}),
    wrong_question_ids: getStorage('wrong_question_ids', []),
    checkin_days: getStorage('checkin_days', []),
    reviewed_today: getStorage('reviewed_today', 0),
  };
}

// 把云端进度写回本地
export function applyProgress(data: Record<string, unknown>) {
  if (data.fsrs_card_states) setStorage('fsrs_card_states', data.fsrs_card_states);
  if (data.wrong_question_ids) setStorage('wrong_question_ids', data.wrong_question_ids);
  if (data.checkin_days) setStorage('checkin_days', data.checkin_days);
  if (data.reviewed_today != null) setStorage('reviewed_today', data.reviewed_today as number);
}

// 推送到云端
export async function pushProgress(): Promise<boolean> {
  const sb = getSupabase();
  const uid = await currentUserId();
  if (!sb || !uid) return false;
  const { error } = await sb.from('progress').upsert(
    { user_id: uid, data: collectProgress(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  return !error;
}

// 从云端拉取
export async function pullProgress(): Promise<boolean> {
  const sb = getSupabase();
  const uid = await currentUserId();
  if (!sb || !uid) return false;
  const { data, error } = await sb
    .from('progress')
    .select('data')
    .eq('user_id', uid)
    .maybeSingle();
  if (error || !data) return false;
  applyProgress(data.data as Record<string, unknown>);
  return true;
}

// 自动同步（防抖），学习数据变化后调用
let timer: ReturnType<typeof setTimeout> | null = null;
export function schedulePush(delay = 2000) {
  if (!isSupabaseConfigured()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void pushProgress();
  }, delay);
}
