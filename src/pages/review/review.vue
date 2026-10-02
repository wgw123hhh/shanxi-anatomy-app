<template>
  <view class="page">
    <!-- 完成态 -->
    <view v-if="finished" class="center">
      <text class="emoji">🎉</text>
      <text class="title">今日任务完成</text>
      <text class="sub">已复习 {{ reviewed }} 张卡片{{ checkedIn ? '，打卡成功' : '' }}</text>
      <text class="sub light">明天再来巩固记忆</text>
    </view>

    <!-- 无卡可学 -->
    <view v-else-if="!current" class="center">
      <text class="emoji">🌿</text>
      <text class="title">今天没有待复习的卡片</text>
      <text class="sub light">所有卡片都排到之后啦</text>
    </view>

    <!-- 卡片态 -->
    <template v-else>
      <view class="progress">
        <text class="tnum">{{ index + 1 }} / {{ queue.length }}</text>
        <text>今日目标 {{ DAILY_TARGET }} 张</text>
      </view>

      <view class="flip-card" :class="{ flipped: showBack }" @tap="showBack = true">
        <view class="flip-inner">
          <view class="flip-face front">
            <view class="card-top">
              <text class="tag">{{ current.section }}</text>
              <text v-if="current.importance" class="tag imp">{{ current.importance }}</text>
            </view>
            <text class="card-text">{{ current.front }}</text>
            <text class="hint">点击卡片查看答案</text>
          </view>
          <view class="flip-face back">
            <view class="card-top">
              <text class="tag">{{ current.section }}</text>
              <text v-if="current.importance" class="tag imp">{{ current.importance }}</text>
            </view>
            <text class="card-text answer">{{ current.back }}</text>
            <view v-if="extraEntries.length" class="extra">
              <view v-for="e in extraEntries" :key="e[0]" class="extra-item">
                <text class="extra-key">{{ e[0] }}</text>
                <text class="extra-val">{{ e[1] }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!showBack" class="actions">
        <button class="btn-primary" @tap="showBack = true">显示答案</button>
      </view>
      <view v-else class="actions">
        <view
          v-for="g in grades"
          :key="g.key"
          class="grade-btn"
          :style="{ background: g.color }"
          @tap="doGrade(g.grade)"
        >
          {{ g.label }}
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  DAILY_TARGET,
  addReviewedToday,
  getDueCards,
  getReviewedToday,
  gradeCard,
  markCheckedIn,
} from '@/utils/cards';
import { Rating, type Grade } from '@/utils/fsrs';
import type { CardContent } from '@/utils/types';

const grades: { key: string; label: string; grade: Grade; color: string }[] = [
  { key: 'again', label: '不认识', grade: Rating.Again, color: '#e11d48' },
  { key: 'hard', label: '模糊', grade: Rating.Hard, color: '#d97706' },
  { key: 'good', label: '认识', grade: Rating.Good, color: '#059669' },
  { key: 'easy', label: '熟练', grade: Rating.Easy, color: '#0284c7' },
];

const queue = ref<CardContent[]>([]);
const index = ref(0);
const showBack = ref(false);
const reviewed = ref(0);
const checkedIn = ref(false);

const current = computed(() => queue.value[index.value] ?? null);
const finished = computed(() => queue.value.length > 0 && index.value >= queue.value.length);
const extraEntries = computed(() =>
  current.value?.extra ? Object.entries(current.value.extra) : []
);

onShow(load);

function load() {
  queue.value = getDueCards();
  index.value = 0;
  showBack.value = false;
  reviewed.value = getReviewedToday();
}

function doGrade(grade: Grade) {
  const card = current.value;
  if (!card) return;
  gradeCard(card.id, grade);
  addReviewedToday();
  reviewed.value = getReviewedToday();
  if (reviewed.value >= DAILY_TARGET) {
    markCheckedIn();
    checkedIn.value = true;
  }
  if (index.value + 1 < queue.value.length) {
    index.value += 1;
    showBack.value = false;
  } else {
    index.value = queue.value.length;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.center {
  flex: 1;
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
}
.sub.light {
  color: var(--text-3);
}
.progress {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: var(--text-3);
  margin-bottom: 24rpx;
}
.flip-card {
  perspective: 1200rpx;
}
.flip-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);
  display: grid;
  min-height: 520rpx;
}
.flip-card.flipped .flip-inner {
  transform: rotateY(180deg);
}
.flip-face {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--surface);
  border-radius: 28rpx;
  padding: 44rpx 40rpx;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}
.flip-face.back {
  transform: rotateY(180deg);
}
.card-top {
  display: flex;
  gap: 12rpx;
  margin-bottom: 36rpx;
}
.tag {
  font-size: 22rpx;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}
.tag.imp {
  color: #b45309;
  background: #fdf0e3;
}
.card-text {
  font-size: 40rpx;
  line-height: 1.55;
  font-weight: 600;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.card-text.answer {
  color: var(--brand-dark);
}
.hint {
  text-align: center;
  font-size: 24rpx;
  color: var(--text-3);
  margin-top: 24rpx;
}
.extra {
  margin-top: 32rpx;
  border-top: 1rpx solid var(--line);
  padding-top: 24rpx;
}
.extra-item {
  display: flex;
  margin-bottom: 16rpx;
  font-size: 26rpx;
}
.extra-key {
  color: var(--text-3);
  width: 96rpx;
  flex-shrink: 0;
}
.extra-val {
  color: var(--text-2);
  flex: 1;
}
.actions {
  margin-top: 44rpx;
  display: flex;
  gap: 20rpx;
}
.grade-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 18rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  transition: transform 0.15s ease;
}
.grade-btn:active {
  transform: scale(0.96);
}
</style>
