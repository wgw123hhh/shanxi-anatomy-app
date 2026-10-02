// 内容加载：内置兜底 + 本地缓存 + 云端下发
import cardJson from '@/content/cards.json';
import questionJson from '@/content/questions.json';
import visceralJson from '@/content/visceral.json';
import sensoryJson from '@/content/sensory.json';
import endocrineJson from '@/content/endocrine.json';
import { getStorage, setStorage } from './storage';
import { getSupabase } from './supabase';
import type { CardContent, Question } from './types';

const CACHE_KEY = 'content_cache';
const VERSION_KEY = 'content_version';

// 内置兜底内容（打包进 App，离线可用）
const bundledCards: CardContent[] = [
  ...(cardJson as { cards: CardContent[] }).cards,
  ...(visceralJson as { cards: CardContent[] }).cards,
  ...(sensoryJson as { cards: CardContent[] }).cards,
  ...(endocrineJson as { cards: CardContent[] }).cards,
];

const bundledQuestions: Question[] = [
  ...(questionJson as { questions: Question[] }).questions,
  ...(visceralJson as { questions: Question[] }).questions,
  ...(sensoryJson as { questions: Question[] }).questions,
  ...(endocrineJson as { questions: Question[] }).questions,
];

export interface ContentCache {
  cards: CardContent[];
  questions: Question[];
}

function getCachedContent(): ContentCache | null {
  return getStorage<ContentCache | null>(CACHE_KEY, null);
}

export function getCards(): CardContent[] {
  return getCachedContent()?.cards ?? bundledCards;
}

export function getQuestions(): Question[] {
  return getCachedContent()?.questions ?? bundledQuestions;
}

// 从云端拉取最新内容，若有新版本则缓存（下次启动生效）
export async function refreshContent(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data, error } = await sb
      .from('content')
      .select('data, version')
      .eq('key', 'main')
      .maybeSingle();
    if (error || !data) return false;
    const remote = data as { data: ContentCache; version: number };
    const localVersion = getStorage<number>(VERSION_KEY, 0);
    if (remote.version > localVersion) {
      setStorage(CACHE_KEY, remote.data);
      setStorage(VERSION_KEY, remote.version);
      return true;
    }
    return false;
  } catch (e) {
    console.error('refreshContent error', e);
    return false;
  }
}
