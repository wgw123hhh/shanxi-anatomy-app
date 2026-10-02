// 卡片复习（打卡记忆）业务逻辑
import { getCards } from './content';
import { getStorage, setStorage } from './storage';
import { schedulePush } from './supabase';
import { deserializeCard, newEmptyCard, schedule, serializeCard } from './fsrs';
import type { Grade } from './fsrs';
import type { CardContent } from './types';

const CARD_STATE_KEY = 'fsrs_card_states'; // { cardId: 序列化的FSRS卡片 }
const CHECKIN_KEY = 'checkin_days'; // ['YYYY-MM-DD']
export const DAILY_TARGET = 20; // 每日打卡目标（复习卡片数）

export function getCardById(id: string): CardContent | undefined {
  return getCards().find((c) => c.id === id);
}

export function getCardState(id: string) {
  const map = getStorage<Record<string, string>>(CARD_STATE_KEY, {});
  const s = map[id];
  return s ? deserializeCard(s) : null;
}

function saveCardState(id: string, card: ReturnType<typeof newEmptyCard>) {
  const map = getStorage<Record<string, string>>(CARD_STATE_KEY, {});
  map[id] = serializeCard(card);
  setStorage(CARD_STATE_KEY, map);
}

// 今日待复习队列：到期的旧卡在前，新卡在后
export function getDueCards(now: Date = new Date()): CardContent[] {
  const states = getStorage<Record<string, string>>(CARD_STATE_KEY, {});
  const due: CardContent[] = [];
  const fresh: CardContent[] = [];
  for (const c of getCards()) {
    const s = states[c.id];
    if (!s) {
      fresh.push(c);
    } else if (deserializeCard(s).due.getTime() <= now.getTime()) {
      due.push(c);
    }
  }
  return [...due, ...fresh];
}

// 对一张卡片评分，更新其 FSRS 状态
export function gradeCard(id: string, grade: Grade, now: Date = new Date()) {
  let card = getCardState(id);
  if (!card) card = newEmptyCard(now);
  saveCardState(id, schedule(card, grade, now));
  schedulePush();
}

// 已复习卡片数（今日）
export function getReviewedToday(): number {
  return getStorage<number>('reviewed_today', 0);
}

export function addReviewedToday() {
  setStorage('reviewed_today', getReviewedToday() + 1);
  schedulePush();
}

// ---- 打卡 ----
export function todayStr(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isCheckedIn(date = todayStr()): boolean {
  return getStorage<string[]>(CHECKIN_KEY, []).includes(date);
}

export function getCheckinDays(): string[] {
  return getStorage<string[]>(CHECKIN_KEY, []);
}

export function markCheckedIn(date = todayStr()) {
  const days = getStorage<string[]>(CHECKIN_KEY, []);
  if (!days.includes(date)) {
    days.push(date);
    setStorage(CHECKIN_KEY, days);
    schedulePush();
  }
}

export function getStreak(): number {
  const set = new Set(getStorage<string[]>(CHECKIN_KEY, []));
  let streak = 0;
  const d = new Date();
  if (!set.has(todayStr(d))) d.setDate(d.getDate() - 1); // 今天未打卡则从昨天起算
  while (set.has(todayStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
