// FSRS 间隔重复调度封装（ts-fsrs）
import { fsrs, createEmptyCard, Rating, type Card, type Grade } from 'ts-fsrs';

const scheduler = fsrs();

export type { Card, Grade };
export { Rating };

export function newEmptyCard(now: Date = new Date()): Card {
  return createEmptyCard(now);
}

// 根据本次作答评分，计算并返回下一次复习状态
export function schedule(card: Card, grade: Grade, now: Date = new Date()): Card {
  return scheduler.next(card, now, grade).card;
}

// 序列化：Date 显式转 ISO 字符串（ts-fsrs 的 Card 带自定义 toJSON，不能用 instanceof 拦截）
export function serializeCard(card: Card): string {
  const plain = {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
  return JSON.stringify(plain);
}

// 反序列化
export function deserializeCard(s: string): Card {
  const o = JSON.parse(s);
  o.due = new Date(o.due);
  if (o.last_review) o.last_review = new Date(o.last_review);
  return o as Card;
}
