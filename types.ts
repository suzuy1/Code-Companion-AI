export enum MessageRole {
  USER = 'user',
  AI = 'model',
}

export interface Source {
  uri: string;
  title: string;
}

// Added for type safety with grounding chunks
export interface GroundingChunk {
  web: Source;
}

export interface ThinkingStep {
  id: 'analyze' | 'search' | 'draft' | 'generate';
  label: string;
}

export interface ThinkingState {
  steps: ThinkingStep[];
  activeStepIndex: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  base64Image?: { data: string, mimeType: string };
  sources?: Source[];
  thinkingState?: ThinkingState | null;
  isError?: boolean;
  retryable?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}