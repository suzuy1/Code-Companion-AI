import { useState, useEffect, useCallback } from 'react';
import { ChatSession } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatSessions = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem('chatSessions');
            if (savedSessions) {
                setSessions(JSON.parse(savedSessions));
            }
            const savedActiveId = localStorage.getItem('activeSessionId');
            if (savedActiveId && savedActiveId !== 'null') {
                setActiveSessionId(savedActiveId);
            }
        } catch (e) {
            console.error("Failed to load sessions from localStorage", e);
            localStorage.removeItem('chatSessions');
            localStorage.removeItem('activeSessionId');
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('chatSessions', JSON.stringify(sessions));
            localStorage.setItem('activeSessionId', activeSessionId || 'null');
        } catch (e) {
            console.error("Failed to save sessions to localStorage", e);
        }
    }, [sessions, activeSessionId]);

    const updateSession = useCallback((sessionId: string, updateFn: (session: ChatSession) => ChatSession) => {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === sessionId ? updateFn(session) : session
            )
        );
    }, []);
    
    const createNewSession = useCallback((title: string): string => {
        const newSessionId = generateId();
        const newSession: ChatSession = {
            id: newSessionId,
            title: title || 'Obrolan baru',
            messages: [],
            createdAt: new Date().toISOString()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSessionId);
        return newSessionId;
    }, []);

    const handleNewChat = () => {
        setActiveSessionId(null);
    };

    const handleSelectSession = (id: string) => {
        setActiveSessionId(id);
    };

    const handleDeleteSession = (id: string) => {
        setSessions(prev => prev.filter(session => session.id !== id));
        if (activeSessionId === id) {
            setActiveSessionId(null);
        }
    };

    const handleRenameSession = (id: string, newTitle: string) => {
        updateSession(id, session => ({ ...session, title: newTitle }));
    };

    return {
        sessions,
        setSessions,
        activeSessionId,
        setActiveSessionId,
        updateSession,
        createNewSession,
        handleNewChat,
        handleSelectSession,
        handleDeleteSession,
        handleRenameSession,
    };
};
