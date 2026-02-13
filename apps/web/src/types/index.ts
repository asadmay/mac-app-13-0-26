// ===== Типы из v1 (МАК-практика) =====

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DeckIndexItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isPremium: boolean;
  file: string;
};

export type Card = {
  id: string;
  imageUrl: string;
  keywords?: string[];
};

export type Deck = {
  id: string;
  name: string;
  emoji: string;
  cardCount: number;
  cards: Card[];
  description?: string;
  isPremium?: boolean;
};

export type SpreadPosition = {
  id: string;
  label: string;
  question: string;
};

export type Spread = {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: Difficulty;
  positions: SpreadPosition[];
};

export type SessionCard = {
  positionId: string;
  label: string;
  question: string;
  cardId: string;
  imageUrl: string;
  keywords: string[];
  note: string;
};

export type PracticeMode = 'self' | 'pro';

export type Practice = {
  id: string;
  title: string;
  emoji: string;
  durationMin: number;
  goal: string;
  description: string;
  defaultDeckId: string;
  allowedDeckIds?: string[];
  recommendedSpreadId: string;
  defaultQuestion: string;
  steps: string[];
  selfPrompts: string[];
  proPrompts: string[];
};

export type PracticePreset = {
  practiceId: string;
  practiceTitle: string;
  practiceEmoji: string;
  practiceMode: PracticeMode;
  deckId: string;
  allowedDeckIds?: string[];
  spreadId: string;
  question: string;
};

export type Session = {
  id: string;
  createdAt: number;
  question: string;
  takeaway: string;
  deckId: string;
  deckName: string;
  spreadId: string;
  spreadName: string;
  practiceId?: string;
  practiceTitle?: string;
  practiceMode?: PracticeMode;
  cards: SessionCard[];
};

export type FreeCard = {
  id: string;
  cardId: string;
  imageUrl: string;
  keywords: string[];
  note: string;
  createdAt: number;
};

// ===== Типы из v2 (Daily/Journal) =====

export type DailyCard = {
  id: string;
  title: string;
  prompt: string;
  image?: string;
};

export type DailyEntry = {
  id: string;
  kind: 'daily';
  createdAt: number;
  dateISO: string;
  card: DailyCard;
  a1: string;
  a2: string;
  a3: string;
  microStep: string;
  summary: string;
};

export type DailyMode = 'short' | 'standard' | 'deep';