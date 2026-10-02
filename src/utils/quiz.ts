// 刷题业务逻辑
import { getQuestions } from './content';
import { getStorage, setStorage } from './storage';
import { schedulePush } from './supabase';
import type { Question } from './types';

const WRONG_KEY = 'wrong_question_ids';

export interface SectionInfo {
  chapter: string;
  section: string;
  count: number;
}

export function getSections(): SectionInfo[] {
  const map = new Map<string, number>();
  for (const q of getQuestions()) {
    const key = `${q.chapter}｜${q.section}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([k, count]) => {
    const [chapter, section] = k.split('｜');
    return { chapter, section, count };
  });
}

export function getQuestionsBySection(chapter: string, section: string): Question[] {
  return getQuestions().filter((q) => q.chapter === chapter && q.section === section);
}

// ---- 错题本 ----
export function getWrongIds(): string[] {
  return getStorage<string[]>(WRONG_KEY, []);
}

export function addWrong(id: string) {
  const ids = getWrongIds();
  if (!ids.includes(id)) {
    ids.push(id);
    setStorage(WRONG_KEY, ids);
    schedulePush();
  }
}

export function removeWrong(id: string) {
  setStorage(
    WRONG_KEY,
    getWrongIds().filter((x) => x !== id)
  );
  schedulePush();
}

export function isWrong(id: string): boolean {
  return getWrongIds().includes(id);
}

export function getWrongQuestions(): Question[] {
  const ids = new Set(getWrongIds());
  return getQuestions().filter((q) => ids.has(q.id));
}
