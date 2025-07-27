import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Part, Content, SendMessageParameters } from '@google/genai';
import { Message, ChatSession, MessageRole, Source, ThinkingStep, ThinkingState, GroundingChunk } from '../types';
import { GOD_LEVEL_SYSTEM_INSTRUCTION, THINKING_SIMULATION_INTERVAL } from '../constants';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Hook dependencies type
interface UseGeminiChatProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    updateSession: (sessionId: string, updateFn: (session: ChatSession) => ChatSession) => void;
    createNewSession: (title: string) => string;
    model: string;
}

export const useGeminiChat = ({ sessions, activeSessionId, updateSession, createNewSession, model }: UseGeminiChatProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const thinkingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastWebSearchChoice = useRef(false);

    useEffect(() => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API_KEY environment variable not set.");
            }
            setAi(new GoogleGenAI({ apiKey }));
        } catch (e: any) {
            console.error("Initialization error:", e);
            // Handle initialization error by showing it in the first message if possible
        }
    }, []);

    const handleStopGeneration = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    const handleSendMessage = useCallback(async (prompt: string, image?: { data: string; mimeType: string; preview: string }, useWebSearch?: boolean) => {
        if (!prompt.trim() && !image) return;
        if (!ai) {
             // Immediately create a session to show the error
            const tempSessionId = activeSessionId || createNewSession("Error");
            const errorMessage: Message = {
                id: generateId(),
                role: MessageRole.AI,
                content: "AI Client not initialized. Please ensure the API key is correctly configured.",
                isError: true,
            };
            updateSession(tempSessionId, session => ({ ...session, messages: [...session.messages, errorMessage] }));
            return;
        }

        lastWebSearchChoice.current = useWebSearch || false;

        if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
        abortControllerRef.current = new AbortController();

        let currentSessionId = activeSessionId;
        let messagesForHistory: Message[] = [];
        let createdNewSession = false;

        if (!currentSessionId) {
            const newTitle = prompt.substring(0, 40) + (image ? ' (dengan gambar)' : '') || 'Obrolan baru';
            currentSessionId = createNewSession(newTitle);
            createdNewSession = true;
        }

        if (!createdNewSession) {
            messagesForHistory = sessions.find(s => s.id === currentSessionId)?.messages || [];
        }

        const userMessage: Message = {
            id: generateId(),
            role: MessageRole.USER,
            content: prompt,
            imageUrl: image?.preview,
            base64Image: image ? { data: image.data, mimeType: image.mimeType } : undefined,
        };

        const baseSteps: ThinkingStep[] = [
            { id: 'analyze', label: 'Menganalisis Permintaan' },
            { id: 'draft', label: 'Menyusun Kerangka' },
            { id: 'generate', label: 'Menghasilkan Respons' },
        ];
        if (useWebSearch) {
            baseSteps.splice(1, 0, { id: 'search', label: 'Mencari di Web' });
        }
        
        const initialThinkingState: ThinkingState = {
            steps: baseSteps,
            activeStepIndex: 0,
        };

        const aiPlaceholderMessage: Message = { 
            id: generateId(),
            role: MessageRole.AI, 
            content: '',
            thinkingState: initialThinkingState 
        };

        updateSession(currentSessionId, session => ({
            ...session,
            messages: [...session.messages, userMessage, aiPlaceholderMessage]
        }));

        setIsLoading(true);

        const intervalId = setInterval(() => {
            updateSession(currentSessionId, session => {
                const lastMessage = session.messages.find(m => m.id === aiPlaceholderMessage.id);
                if (lastMessage?.role === MessageRole.AI && lastMessage.thinkingState) {
                    const newIndex = lastMessage.thinkingState.activeStepIndex + 1;
                    if (newIndex >= lastMessage.thinkingState.steps.length) {
                        if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
                        thinkingIntervalRef.current = null;
                        return session; 
                    }
                    return { 
                        ...session, 
                        messages: session.messages.map(m => m.id === aiPlaceholderMessage.id 
                            ? { ...m, thinkingState: { ...m.thinkingState!, activeStepIndex: newIndex } }
                            : m
                        ) 
                    };
                }
                if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
                return session;
            });
        }, THINKING_SIMULATION_INTERVAL);
        thinkingIntervalRef.current = intervalId;

        try {
            const history: Content[] = messagesForHistory.map((msg): Content | null => {
                if(msg.isError) return null; // Don't include errored messages in history
                const parts: Part[] = [];
                if (msg.role === MessageRole.USER && msg.base64Image) {
                    parts.push({
                        inlineData: { data: msg.base64Image.data, mimeType: msg.base64Image.mimeType }
                    });
                }
                parts.push({ text: msg.content });
                return { role: msg.role, parts };
            }).filter((c): c is Content => c !== null);

            const chat = ai.chats.create({
                model: model,
                config: { systemInstruction: GOD_LEVEL_SYSTEM_INSTRUCTION },
                history,
            });

            const partsForSending: Part[] = [];
            if (image) {
                partsForSending.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
            }
            partsForSending.push({ text: prompt });
            
            const sendMessageParams: SendMessageParameters = { message: partsForSending };
            if (useWebSearch) {
                sendMessageParams.config = { tools: [{ googleSearch: {} }] };
            }

            const stream = await chat.sendMessageStream(sendMessageParams);
            
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }
            
            let fullResponse = '';
            let sources: Source[] = [];
            for await (const chunk of stream) {
                if (abortControllerRef.current?.signal.aborted) {
                    const abortError = new Error("Generation stopped by user.");
                    abortError.name = 'AbortError';
                    throw abortError;
                }
                
                fullResponse += chunk.text;

                const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
                if (groundingChunks) {
                    const newSources: Source[] = groundingChunks
                        .map(chunk => chunk.web)
                        .filter((web): web is Source => !!(web?.uri && web?.title))
                        .reduce((acc: Source[], current: Source) => { // Deduplicate
                            if (!acc.some(item => item.uri === current.uri)) {
                                acc.push({ uri: current.uri, title: current.title });
                            }
                            return acc;
                        }, []) || [];
                    
                    newSources.forEach(source => {
                        if (!sources.some(s => s.uri === source.uri)) {
                            sources.push(source);
                        }
                    });
                }
                
                updateSession(currentSessionId, session => ({
                    ...session,
                    messages: session.messages.map(m => m.id === aiPlaceholderMessage.id ? { 
                        ...m,
                        content: fullResponse,
                        sources: sources.length > 0 ? [...sources] : undefined,
                        thinkingState: null
                     } : m)
                }));
            }
        } catch (e: any) {
            const errorMessage = e.message || "An unexpected error occurred. Please try again.";
            if (e.name === 'AbortError') {
                console.log("Generation stopped by user.");
                 updateSession(currentSessionId, session => ({
                    ...session,
                    messages: session.messages.map(m => m.id === aiPlaceholderMessage.id ? { 
                        ...m,
                        content: m.content + "\n\n*Proses dihentikan oleh pengguna.*",
                        thinkingState: null 
                     } : m)
                }));
            } else {
                console.error("Error sending message:", e);
                updateSession(currentSessionId, session => ({
                    ...session,
                    messages: session.messages.map(m => m.id === aiPlaceholderMessage.id ? { 
                        ...m,
                        content: errorMessage,
                        thinkingState: null,
                        isError: true,
                        retryable: true,
                     } : m)
                }));
            }
        } finally {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [ai, activeSessionId, sessions, updateSession, createNewSession, model]);
    
    const handleRetry = useCallback((sessionId: string, messageId: string) => {
        const sessionToRetry = sessions.find(s => s.id === sessionId);
        if (!sessionToRetry) return;

        const messageIndex = sessionToRetry.messages.findIndex(m => m.id === messageId);
        if (messageIndex < 1) return; // Cannot retry if it's the first message or not found

        const userMessageToRetry = sessionToRetry.messages[messageIndex - 1];
        if (userMessageToRetry.role !== MessageRole.USER) return;

        // Remove the failed AI message and the user message that caused it
        updateSession(sessionId, s => ({
            ...s,
            messages: s.messages.slice(0, messageIndex - 1)
        }));

        // Resend the original user message
        handleSendMessage(
            userMessageToRetry.content,
            userMessageToRetry.base64Image ? { ...userMessageToRetry.base64Image, preview: userMessageToRetry.imageUrl! } : undefined,
            lastWebSearchChoice.current // Use the last known web search choice for the retry
        );

    }, [sessions, updateSession, handleSendMessage]);

    return { isLoading, handleSendMessage, handleStopGeneration, handleRetry };
};