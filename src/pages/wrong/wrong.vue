<template>
  <view class="page">
    <view v-if="wrongList.length === 0" class="center">
      <text class="emoji">🌟</text>
      <text class="title">暂无错题</text>
      <text class="sub">刷题中做错的题会自动收录到这里</text>
    </view>

    <view v-else class="list">
      <view v-for="q in wrongList" :key="q.id" class="item">
        <view class="item-head" @tap="toggle(q.id)">
          <text class="item-type">{{ typeLabel(q.type) }}</text>
          <text class="item-stem">{{ q.stem }}</text>
          <text class="item-arrow">{{ open === q.id ? '▾' : '▸' }}</text>
        </view>
        <view v-if="open === q.id" class="item-body">
          <text class="label">答案</text>
          <text class="body-text">{{ answerText(q) }}</text>
          <text class="label">解析</text>
          <text class="body-text">{{ q.analysis || '暂无解析' }}</text>
          <button class="btn-mastered" @tap="master(q.id)">已掌握，移除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getWrongQuestions, removeWrong } from '@/utils/quiz';
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

const wrongList = ref<Question[]>([]);
const open = ref<string>('');

onShow(() => {
  wrongList.value = getWrongQuestions();
});

function typeLabel(t: QuestionType) {
  return TYPE_LABELS[t];
}

function toggle(id: string) {
  open.value = open.value === id ? '' : id;
}

function master(id: string) {
  removeWrong(id);
  wrongList.value = getWrongQuestions();
}

function answerText(q: Question): string {
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
  color: var(--text-3);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.item {
  background: var(--surface);
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.item-head {
  padding: 28rpx;
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}
.item-type {
  font-size: 22rpx;
  color: #e11d48;
  background: #fde8ec;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}
.item-stem {
  font-size: 30rpx;
  color: var(--text);
  flex: 1;
  line-height: 1.5;
}
.item-arrow {
  color: var(--text-3);
  flex-shrink: 0;
}
.item-body {
  padding: 24rpx 28rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  border-top: 1rpx solid var(--line);
}
.label {
  font-size: 22rpx;
  color: var(--text-3);
  margin-top: 8rpx;
}
.body-text {
  font-size: 28rpx;
  color: var(--text);
  line-height: 1.6;
}
.btn-mastered {
  margin-top: 20rpx;
  height: 80rpx;
  border-radius: 14rpx;
  background: #eafaf1;
  color: #059669;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
