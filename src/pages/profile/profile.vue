<template>
  <view class="page">
    <!-- 未配置 Supabase -->
    <view v-if="!configured" class="card">
      <text class="title">云同步未开启</text>
      <text class="desc">
        当前为纯本地模式，学习数据只保存在本机。{"\n"}要开启账号登录与跨设备同步，请：{"\n"}
        1. 在 supabase.com 新建项目；{"\n"}
        2. 把 URL 和 anon key 填入 app/src/utils/config.ts。
      </text>
    </view>

    <!-- 已配置但未登录 -->
    <view v-else-if="!email" class="card">
      <text class="title">登录 / 注册</text>
      <input
        v-model="emailInput"
        class="input"
        type="text"
        placeholder="邮箱"
        placeholder-class="ph"
      />
      <input
        v-model="passwordInput"
        class="input"
        type="password"
        placeholder="密码"
        placeholder-class="ph"
      />
      <button class="btn-primary" :disabled="loading" @tap="signIn">登录</button>
      <button class="btn-outline" :disabled="loading" @tap="signUp">注册新账号</button>
      <text v-if="message" class="msg">{{ message }}</text>
    </view>

    <!-- 已登录 -->
    <view v-else class="card">
      <text class="title">已登录</text>
      <text class="account">{{ email }}</text>

      <button class="btn-outline" :disabled="syncing" @tap="pull">拉取云端进度</button>
      <button class="btn-primary" :disabled="syncing" @tap="push">推送本地进度</button>
      <button class="btn-danger" @tap="signOut">退出登录</button>
      <text v-if="message" class="msg">{{ message }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  getSupabase,
  isSupabaseConfigured,
  pullProgress,
  pushProgress,
} from '@/utils/supabase';

const configured = isSupabaseConfigured();
const email = ref('');
const emailInput = ref('');
const passwordInput = ref('');
const loading = ref(false);
const syncing = ref(false);
const message = ref('');

onShow(async () => {
  const sb = getSupabase();
  if (!sb) return;
  const { data } = await sb.auth.getUser();
  email.value = data.user?.email ?? '';
});

function toast(msg: string) {
  message.value = msg;
  uni.showToast({ title: msg, icon: 'none' });
}

async function signIn() {
  const sb = getSupabase();
  if (!sb || !emailInput.value || !passwordInput.value) {
    toast('请输入邮箱和密码');
    return;
  }
  loading.value = true;
  const { data, error } = await sb.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  loading.value = false;
  if (error) return toast(error.message);
  email.value = data.user?.email ?? '';
  toast('登录成功');
  await pullProgress();
}

async function signUp() {
  const sb = getSupabase();
  if (!sb || !emailInput.value || !passwordInput.value) {
    toast('请输入邮箱和密码');
    return;
  }
  loading.value = true;
  const { error } = await sb.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  loading.value = false;
  if (error) return toast(error.message);
  toast('注册成功，请到邮箱确认后登录');
}

async function pull() {
  syncing.value = true;
  const ok = await pullProgress();
  syncing.value = false;
  toast(ok ? '已拉取云端进度' : '拉取失败（云端暂无数据）');
}

async function push() {
  syncing.value = true;
  const ok = await pushProgress();
  syncing.value = false;
  toast(ok ? '已推送本地进度' : '推送失败');
}

async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  email.value = '';
  toast('已退出登录');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
}
.card {
  background: var(--surface);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  box-shadow: var(--shadow);
}
.title {
  font-size: 36rpx;
  font-weight: 700;
}
.desc {
  font-size: 28rpx;
  color: var(--text-2);
  line-height: 1.7;
}
.account {
  font-size: 30rpx;
  color: var(--brand);
  font-weight: 600;
}
.input {
  height: 88rpx;
  border: 2rpx solid var(--line);
  border-radius: 14rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
}
.ph {
  color: var(--text-3);
}
.msg {
  font-size: 26rpx;
  color: var(--text-2);
  text-align: center;
}
.btn-danger {
  height: 96rpx;
  border-radius: 20rpx;
  background: #fde8ec;
  color: #e11d48;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
