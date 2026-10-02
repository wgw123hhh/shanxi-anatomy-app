<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { refreshContent } from "@/utils/content";
onLaunch(() => {
  console.log("App Launch");
  refreshContent();
});
</script>

<style>
page {
  /* 设计令牌 */
  --brand: #0d9488;
  --brand-dark: #0f766e;
  --brand-soft: #e6f4f2;
  --text: #1f2937;
  --text-2: #64748b;
  --text-3: #94a3b8;
  --bg: #f3f5f4;
  --surface: #ffffff;
  --line: #e7ecea;
  --shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
  --shadow-lg: 0 10px 28px rgba(15, 23, 42, 0.08);

  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* 数字统一等宽，避免跳动 */
.tnum {
  font-variant-numeric: tabular-nums;
}

/* 重置 button 默认样式 */
button {
  padding: 0;
  margin: 0;
  background: transparent;
  border-radius: 0;
  font-size: inherit;
  line-height: inherit;
}
button::after {
  border: none;
}

.btn-primary {
  height: 96rpx;
  border-radius: 20rpx;
  background: var(--brand);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.22);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 3px 8px rgba(13, 148, 136, 0.18);
}
.btn-primary[disabled] {
  background: #bcd8d3;
  box-shadow: none;
}

.btn-outline {
  height: 96rpx;
  border-radius: 20rpx;
  background: var(--surface);
  color: var(--brand);
  border: 2rpx solid var(--brand);
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}
.btn-outline:active {
  transform: scale(0.98);
}
</style>
