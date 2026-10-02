// 合并题库内容并上传到 Supabase（云端内容下发）
// 用法：SUPABASE_SERVICE_KEY=你的service_role_key node upload-content.mjs
// service_role key 在 Supabase → Project Settings → API → service_role（保密，勿放进 App）

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, 'src', 'content');

const SUPABASE_URL = 'https://tqddnobabqyaziskqrll.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('缺少 SUPABASE_SERVICE_KEY');
  console.error('用法：SUPABASE_SERVICE_KEY=你的service_role_key node upload-content.mjs');
  process.exit(1);
}

function load(name) {
  return JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf-8'));
}

const c1 = load('cards.json').cards;
const q1 = load('questions.json').questions;
const v = load('visceral.json');
const s = load('sensory.json');
const e = load('endocrine.json');

const cards = [...c1, ...v.cards, ...s.cards, ...e.cards];
const questions = [...q1, ...v.questions, ...s.questions, ...e.questions];

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 读取当前版本号，+1
const { data: cur, error: readErr } = await sb
  .from('content')
  .select('version')
  .eq('key', 'main')
  .maybeSingle();

const newVersion = (cur?.version ?? 0) + 1;

const { error } = await sb.from('content').upsert(
  {
    key: 'main',
    data: { cards, questions },
    version: newVersion,
    updated_at: new Date().toISOString(),
  },
  { onConflict: 'key' }
);

if (error) {
  console.error('上传失败:', error.message);
  process.exit(1);
}
console.log(`上传成功：version ${newVersion}，卡片 ${cards.length}，题目 ${questions.length}`);
