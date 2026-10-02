<template>
  <view class="page">
    <view class="hero">
      <view class="hero-left">
        <text class="hero-label">连续打卡</text>
        <view class="hero-row">
          <text class="hero-num tnum">{{ streak }}</text>
          <text class="hero-unit">天</text>
        </view>
      </view>
      <view class="hero-right">
        <text class="hero-label">今日待复习</text>
        <view class="hero-row">
          <text class="hero-num tnum">{{ dueCount }}</text>
          <text class="hero-unit">张</text>
        </view>
      </view>
    </view>

    <view v-if="checkedIn" class="checked-in">✓ 今日已打卡，保持节奏</view>

    <view class="main-actions">
      <button class="btn-primary" @tap="switchTab('/pages/review/review')">开始打卡</button>
      <button class="btn-outline" @tap="switchTab('/pages/quiz/quiz')">章节刷题</button>
    </view>

    <view class="stats">
      <view class="stat" @tap="switchTab('/pages/wrong/wrong')">
        <text class="stat-num tnum">{{ wrongCount }}</text>
        <text class="stat-label">错题</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat" @tap="switchTab('/pages/review/review')">
        <text class="stat-num tnum">{{ cardTotal }}</text>
        <text class="stat-label">知识点卡片</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat" @tap="switchTab('/pages/quiz/quiz')">
        <text class="stat-num tnum">{{ questionTotal }}</text>
        <text class="stat-label">真题</text>
      </view>
    </view>

    <!-- 打卡日历 -->
    <view class="calendar">
      <view class="cal-header">
        <view class="cal-nav" @tap="prevMonth">‹</view>
        <text class="cal-title">{{ calYear }}年{{ calMonth + 1 }}月</text>
        <view class="cal-nav" @tap="nextMonth">›</view>
      </view>
      <view class="cal-week">
        <text v-for="w in weekDays" :key="w" class="cal-weekday">{{ w }}</text>
      </view>
      <view class="cal-grid">
        <view v-for="(c, i) in calendarCells" :key="i" class="cal-cell">
          <view
            v-if="c.day"
            class="cal-day tnum"
            :class="{ checked: c.checked, today: c.isToday, future: c.isFuture }"
          >
            {{ c.day }}
          </view>
        </view>
      </view>
      <view class="cal-legend">
        <view class="legend-item"><view class="dot checked"></view><text>已打卡</text></view>
        <view class="legend-item"><view class="dot today"></view><text>今天</text></view>
      </view>
    </view>

    <view class="footer" @tap="reset">重置学习数据</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  getCheckinDays,
  getDueCards,
  getStreak,
  isCheckedIn,
  todayStr,
} from '@/utils/cards';
import { getWrongIds } from '@/utils/quiz';
import { getCards, getQuestions } from '@/utils/content';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const streak = ref(0);
const dueCount = ref(0);
const wrongCount = ref(0);
const cardTotal = ref(0);
const questionTotal = ref(0);
const checkedIn = ref(false);
const checkinDays = ref<string[]>([]);

const calYear = ref(new Date().getFullYear());
const calMonth = ref(new Date().getMonth());

interface CalCell {
  day: number | null;
  checked?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

const calendarCells = computed<CalCell[]>(() => {
  const year = calYear.value;
  const month = calMonth.value;
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();
  const checkedSet = new Set(checkinDays.value);
  const cells: CalCell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push({
      day: d,
      checked: checkedSet.has(ds),
      isToday: ds === today,
      isFuture: ds > today,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
});

onShow(refresh);

function refresh() {
  streak.value = getStreak();
  dueCount.value = getDueCards().length;
  wrongCount.value = getWrongIds().length;
  checkedIn.value = isCheckedIn();
  checkinDays.value = getCheckinDays();
  cardTotal.value = getCards().length;
  questionTotal.value = getQuestions().length;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value -= 1;
  } else {
    calMonth.value -= 1;
  }
}

function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value += 1;
  } else {
    calMonth.value += 1;
  }
}

function switchTab(url: string) {
  uni.switchTab({ url });
}

function reset() {
  uni.showModal({
    title: '重置数据',
    content: '将清空所有学习进度、打卡和错题记录，确定吗？',
    success: (r) => {
      if (r.confirm) {
        uni.clearStorageSync();
        refresh();
      }
    },
  });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
}
.hero {
  background: #0d9488;
  background-image: radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.12), transparent 55%);
  border-radius: 28rpx;
  padding: 52rpx 44rpx;
  display: flex;
  justify-content: space-between;
  color: #fff;
}
.hero-left,
.hero-right {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.hero-right {
  align-items: flex-end;
}
.hero-label {
  font-size: 24rpx;
  opacity: 0.85;
  letter-spacing: 2rpx;
}
.hero-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}
.hero-num {
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1;
}
.hero-unit {
  font-size: 26rpx;
  opacity: 0.85;
}
.checked-in {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
}
.main-actions {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.stats {
  margin-top: 32rpx;
  background: var(--surface);
  border-radius: 24rpx;
  padding: 40rpx 0;
  display: flex;
  box-shadow: var(--shadow);
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.stat-divider {
  width: 1rpx;
  background: var(--line);
  margin: 8rpx 0;
}
.stat-num {
  font-size: 46rpx;
  font-weight: 700;
  color: var(--text);
}
.stat-label {
  font-size: 24rpx;
  color: var(--text-3);
}
.calendar {
  margin-top: 32rpx;
  background: var(--surface);
  border-radius: 24rpx;
  padding: 36rpx 28rpx 28rpx;
  box-shadow: var(--shadow);
}
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}
.cal-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text);
}
.cal-nav {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: var(--text-2);
  border-radius: 16rpx;
  transition: background 0.15s ease;
}
.cal-nav:active {
  background: var(--brand-soft);
}
.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 12rpx;
}
.cal-weekday {
  text-align: center;
  font-size: 22rpx;
  color: var(--text-3);
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 10rpx;
}
.cal-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 76rpx;
}
.cal-day {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text);
}
.cal-day.checked {
  background: var(--brand);
  color: #fff;
  font-weight: 600;
}
.cal-day.today {
  box-shadow: inset 0 0 0 2rpx var(--brand);
  color: var(--brand);
  font-weight: 600;
}
.cal-day.today.checked {
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.6);
  color: #fff;
}
.cal-day.future {
  color: var(--text-3);
}
.cal-legend {
  margin-top: 24rpx;
  display: flex;
  gap: 32rpx;
  justify-content: center;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 22rpx;
  color: var(--text-3);
}
.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}
.dot.checked {
  background: var(--brand);
}
.dot.today {
  box-shadow: inset 0 0 0 2rpx var(--brand);
}
.footer {
  margin-top: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: var(--text-3);
}
</style>
