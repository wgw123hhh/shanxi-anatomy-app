# 山西专升本解剖打卡学习 App

一款「每日打卡背单词」形态的解剖学记忆 / 刷题 App，内容为山西专升本《人体解剖学》知识点。

## 技术栈

- **uni-app**（Vue3 + TypeScript）
- **ts-fsrs**：FSRS 间隔重复算法（Anki 同款，决定每张卡片的复习时间）
- **Supabase**：账号登录 + 学习进度云同步 + 题库云端下发

## 功能

- **打卡记忆**：知识点卡片 + 3D 翻转 + 「不认识 / 模糊 / 认识 / 熟练」四级评分，按遗忘曲线自动排复习
- **章节刷题**：单选 / 多选 / 名词解释 / 简答 / 论述，自动收录错题
- **打卡日历热力图** + 连续打卡统计
- **账号登录** + 跨设备进度同步
- **题库云端下发**：更新题库无需重装 App

## 快速开始

```bash
npm install
npm run dev:h5     # 浏览器预览
npm run build:h5   # 构建 H5
npm run type-check # 类型检查
```

## Supabase 配置

1. 在 [supabase.com](https://supabase.com) 新建项目
2. 依次执行以下 SQL（在 SQL Editor）：
   - `supabase-schema.sql` —— 学习进度表（账号同步）
   - `supabase-content.sql` —— 题库内容表（云端下发）
3. 把项目的 URL 和 anon key 填到 `src/utils/config.ts`

## 题库更新（云端下发）

```bash
SUPABASE_SERVICE_KEY=你的service_role_key node upload-content.mjs
```

版本号自动 +1，用户下次打开 App 自动拉取新题库。

## 打包

- **Android**：HBuilderX → 发行 → 原生App-云打包（证书选「公共测试证书」）
- **iOS**：需 Apple 开发者账号 + 证书

## 目录结构

```
app/
├── src/
│   ├── content/          # 题库/卡片 JSON（打包内置）
│   ├── pages/            # 首页 / 打卡 / 刷题 / 错题 / 我的
│   ├── utils/            # FSRS / 内容加载 / 存储 / Supabase
│   └── static/           # tabbar 图标 + App 图标
├── supabase-schema.sql   # 进度表建表 SQL
├── supabase-content.sql  # 题库内容表建表 SQL
├── upload-content.mjs    # 题库上传脚本
└── manifest.json         # App 配置（appid / 名称 / 权限）
```
