// 内容数据模型（与 content/*.json 对应）

export interface CardContent {
  id: string;
  chapter: string;
  section: string;
  front: string;
  back: string;
  extra?: Record<string, string>;
  images?: string[];
  tags?: string[];
  importance?: string;
  difficulty?: number;
  source?: string;
  relatedQuestions?: string[];
}

export interface QuestionOption {
  key: string;
  text: string;
}

export type QuestionType =
  | 'single'
  | 'multi'
  | 'blank'
  | 'definition'
  | 'short'
  | 'essay'
  | 'analysis';

export interface Question {
  id: string;
  type: QuestionType;
  chapter: string;
  section: string;
  stem: string;
  options: QuestionOption[];
  answer: string | string[];
  analysis: string;
  knowledgePointIds?: string[];
  importance?: string;
  difficulty?: number;
  source?: string;
  score?: number;
  note?: string;
}
