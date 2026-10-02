<template>
  <view class="page">
    <!-- 章节列表 -->
    <view v-if="view === 'list'" class="list">
      <view v-for="g in groups" :key="g.chapter" class="chapter">
        <text class="chapter-title">{{ g.chapter }}</text>
        <view
          v-for="s in g.sections"
          :key="s.section"
          class="section"
          @tap="startSection(s)"
        >
          <view class="section-left">
            <text class="section-name">{{ s.section }}</text>
            <text class="section-count tnum">{{ s.count }} 题</text>
          </view>
          <text class="section-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 答题 -->
    <view v-else-if="!finished && current">
      <view class="q-progress">
        <text class="tnum">{{ qIndex + 1 }} / {{ questions.length }}</text>
        <text class="q-type">{{ typeLabel(current.type) }}</text>
      </view>

      <view class="q-card">
        <text class="q-stem">{{ current.stem }}</text>

        <view v-if="isObjective(current)" class="options">
          <view
            v-for="o in current.options"
            :key="o.key"
            class="option"
            :class="optionClass(o.key)"
            @tap="tapOption(o.key)"
          >
            <text class="option-key">{{ o.key }}</text>
            <text class="option-text">{{ o.text }}</text>
          </view>
        </view>
      </view>

      <view v-if="isObjective(current) && !answered" class="actions">
        <button
          v-if="current.type === 'multi'"
          class="btn-primary"
          :disabled="selected.length === 0"
          @tap="submit(selected)"
        >
          确认答案
        </button>
      </view>

      <view v-if="!isObjective(current) && !answered" class="actions">
        <button class="btn-primary" @tap="reveal">查看答案</button>
      </view>

      <view v-if="answered" class="result">
        <view class="result-head" :class="correct ? 'ok' : 'no'">
          <text>{{ correct ? '✓ 回答正确' : '✗ 回答错误' }}</text>
        </view>
        <view class="answer-box">
          <text class="answer-label">正确答案</text>
          <text class="answer-text">{{ correctText(current) }}</text>
        </view>
        <view class="answer-box">
          <text class="answer-label">解析</text>
          <text class="answer-text">{{ current.analysis || '暂无解析' }}</text>
        </view>
        <view v-if="!isObjective(current) && !correct" class="self-grade">
          <button class="btn-sm ok" @tap="selfGrade(true)">我答对了</button>
          <button class="btn-sm no" @tap="selfGrade(false)">我答错了</button>
        </view>
        <button class="btn-primary" @tap="next">下一题</button>
      </view>
    </view>

    <!-- 完成 -->
    <view v-else class="center">
      <text class="emoji">✅</text>
      <text class="title">本章节完成</text>
      <text class="sub">答对 <text class="tnum">{{ correctCount }}</text> / {{ questions.length }} 题</text>
      <button class="btn-primary" @tap="backList">返回章节</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getQuestionsBySection, getSections, addWrong } from '@/utils/quiz';
import type { Question, QuestionType } from '@/utils/types';

const TYPE_LABELS: Record<QuestionType, string> = {
  single: '单选',
  multi: '多选',
  blank: '填空',
  definition: '名词解释',
  short: '简答',
  essay: '论述',
  analysis: '综合分析',
};

const view = ref<'list' | 'quiz'>('list');
const questions = ref<Question[]>([]);
const qIndex = ref(0);
const selected = ref<string[]>([]);
const answered = ref(false);
const correct = ref(false);
const correctCount = ref(0);
const finished = ref(false);

const sections = getSections();
const groups = computed(() => {
  const map = new Map<string, typeof sections>();
  for (const s of sections) {
    if (!map.has(s.chapter)) map.set(s.chapter, []);
    map.get(s.chapter)!.push(s);
  }
  return Array.from(map.entries()).map(([chapter, list]) => ({ chapter, sections: list }));
});

const current = computed(() => questions.value[qIndex.value] ?? null);

function typeLabel(t: QuestionType) {
  return TYPE_LABELS[t];
}
function isObjective(q: Question) {
  return q.type === 'single' || q.type === 'multi';
}

function startSection(s: { chapter: string; section: string }) {
  questions.value = getQuestionsBySection(s.chapter, s.section);
  qIndex.value = 0;
  selected.value = [];
  answered.value = false;
  correct.value = false;
  correctCount.value = 0;
  finished.value = false;
  view.value = 'quiz';
}

function tapOption(key: string) {
  if (answered.value) return;
  if (current.value!.type === 'single') {
    selected.value = [key];
    submit([key]);
  } else {
    const i = selected.value.indexOf(key);
    if (i >= 0) selected.value.splice(i, 1);
    else selected.value.push(key);
  }
}

function optionClass(key: string) {
  if (!answered.value) {
    return selected.value.includes(key) ? 'picked' : '';
  }
  const ans = current.value!.answer;
  const correctKeys = Array.isArray(ans) ? ans : [ans];
  if (correctKeys.includes(key)) return 'right';
  if (selected.value.includes(key)) return 'wrong';
  return '';
}

function submit(keys: string[]) {
  const q = current.value!;
  const ok = isCorrect(q, keys);
  answered.value = true;
  correct.value = ok;
  if (ok) correctCount.value += 1;
  else addWrong(q.id);
}

function reveal() {
  answered.value = true;
  correct.value = true;
}

function selfGrade(ok: boolean) {
  correct.value = ok;
  if (ok) correctCount.value += 1;
  else addWrong(current.value!.id);
}

function next() {
  if (qIndex.value + 1 < questions.value.length) {
    qIndex.value += 1;
    selected.value = [];
    answered.value = false;
    correct.value = false;
  } else {
    finished.value = true;
  }
}

function backList() {
  view.value = 'list';
  finished.value = false;
}

function isCorrect(q: Question, keys: string[]): boolean {
  if (Array.isArray(q.answer)) {
    const a = [...q.answer].sort();
    const s = [...keys].sort();
    return a.length === s.length && a.every((v, i) => v === s[i]);
  }
  return keys.length === 1 && keys[0] === q.answer;
}

function correctText(q: Question): string {
  if (Array.isArray(q.answer)) {
    return q.answer
      .map((k) => {
        const o = q.options.find((x) => x.key === k);
        return o ? `${k}. ${o.text}` : k;
      })
      .join('；');
  }
  if (q.options.length) {
    const o = q.options.find((x) => x.key === q.answer);
    return o ? `${q.answer}. ${o.text}` : q.answer;
  }
  return q.answer;
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.chapter-title {
  font-size: 26rpx;
  color: var(--text-3);
  font-weight: 600;
  letter-spacing: 2rpx;
}
.section {
  background: var(--surface);
  border-radius: 18rpx;
  padding: 30rpx 32rpx;
  margin-top: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease;
}
.section:active {
  transform: scale(0.99);
}
.section-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.section-name {
  font-size: 30rpx;
  color: var(--text);
  font-weight: 500;
}
.section-count {
  font-size: 24rpx;
  color: var(--text-3);
}
.section-arrow {
  font-size: 40rpx;
  color: var(--text-3);
}
.q-progress {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: var(--text-3);
  margin-bottom: 24rpx;
}
.q-type {
  color: var(--brand);
  font-weight: 600;
}
.q-card {
  background: var(--surface);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: var(--shadow);
}
.q-stem {
  font-size: 34rpx;
  line-height: 1.6;
  font-weight: 600;
}
.options {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.option {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--line);
  transition: transform 0.12s ease;
}
.option:active {
  transform: scale(0.99);
}
.option-key {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: #f1f4f3;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  flex-shrink: 0;
}
.option-text {
  font-size: 30rpx;
  flex: 1;
}
.option.picked {
  border-color: var(--brand);
  background: var(--brand-soft);
}
.option.picked .option-key {
  background: var(--brand);
  color: #fff;
}
.option.right {
  border-color: #059669;
  background: #eafaf1;
}
.option.right .option-key {
  background: #059669;
  color: #fff;
}
.option.wrong {
  border-color: #e11d48;
  background: #fde8ec;
}
.option.wrong .option-key {
  background: #e11d48;
  color: #fff;
}
.actions {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.result {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.result-head {
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
}
.result-head.ok {
  background: #eafaf1;
  color: #059669;
}
.result-head.no {
  background: #fde8ec;
  color: #e11d48;
}
.answer-box {
  background: var(--surface);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: var(--shadow);
}
.answer-label {
  font-size: 22rpx;
  color: var(--text-3);
}
.answer-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text);
}
.self-grade {
  display: flex;
  gap: 20rpx;
}
.btn-sm {
  flex: 1;
  height: 80rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-sm.ok {
  background: #eafaf1;
  color: #059669;
}
.btn-sm.no {
  background: #fde8ec;
  color: #e11d48;
}
.center {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}
.emoji {
  font-size: 96rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
}
.sub {
  font-size: 28rpx;
  color: var(--text-2);
  margin-bottom: 16rpx;
}
</style>
