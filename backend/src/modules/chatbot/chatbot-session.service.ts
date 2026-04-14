import { randomUUID } from "node:crypto";
import {
  ChatIntentFilters,
  ChatSessionState,
  ChatSessionTurn,
  createEmptyIntentFilters,
} from "./chatbot.types";

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_HISTORY_ITEMS = 8;

const sessions = new Map<string, ChatSessionState>();

function cloneFilters(filters: ChatIntentFilters): ChatIntentFilters {
  return {
    ...filters,
    categoryKeywords: [...filters.categoryKeywords],
    brandKeywords: [...filters.brandKeywords],
    usageTags: [...filters.usageTags],
    searchTerms: [...filters.searchTerms],
    attributeFilters: { ...filters.attributeFilters },
  };
}

function cloneHistory(history: ChatSessionTurn[]): ChatSessionTurn[] {
  return history.map((item) => ({ ...item }));
}

function cloneSession(session: ChatSessionState): ChatSessionState {
  return {
    sessionId: session.sessionId,
    filters: cloneFilters(session.filters),
    updatedAt: session.updatedAt,
    history: cloneHistory(session.history),
  };
}

function createSession(sessionId?: string): ChatSessionState {
  return {
    sessionId: sessionId?.trim() || randomUUID(),
    filters: createEmptyIntentFilters(),
    updatedAt: Date.now(),
    history: [],
  };
}

export class ChatbotSessionService {
  private cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.updatedAt > SESSION_TTL_MS) {
        sessions.delete(sessionId);
      }
    }
  }

  getOrCreateSession(sessionId?: string): ChatSessionState {
    this.cleanupExpiredSessions();

    if (sessionId?.trim()) {
      const existing = sessions.get(sessionId.trim());
      if (existing) {
        return cloneSession(existing);
      }
    }

    const session = createSession(sessionId);
    sessions.set(session.sessionId, cloneSession(session));
    return session;
  }

  saveSession(
    sessionId: string,
    filters: ChatIntentFilters,
    history: ChatSessionTurn[]
  ): ChatSessionState {
    this.cleanupExpiredSessions();

    const nextSession: ChatSessionState = {
      sessionId,
      filters: cloneFilters(filters),
      updatedAt: Date.now(),
      history: cloneHistory(history).slice(-MAX_HISTORY_ITEMS),
    };

    sessions.set(sessionId, cloneSession(nextSession));
    return nextSession;
  }
}
