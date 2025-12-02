import { Router, Request, Response } from 'express';
import AIService, { AIRequest, AIMessage } from '../lib/AIProvider.ts';
import Logger from '../lib/Logger.ts';
import { AIMessageRole } from '../lib/constents.ts';
import { sessionEntity } from '../entity/session.entity.ts';
import { messageEntity } from '../entity/message.entity.ts';
import { MessageRole, Prisma } from '@prisma/client';

const router = Router();
const logger = Logger.of('ai-route');

const validateRequestBody = (body: any) => {
    if (!body || Object.keys(body).length === 0) {
        return 'Request body is required';
    }
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return 'messages must be a non-empty array';
    }
    return null;
};

const buildAIRequest = (body: any): AIRequest => {
    const { messages, model, temperature, max_tokens, stream } = body;

    const validMessages: AIMessage[] = messages.map((msg: any) => {
        if (!msg.role || !msg.content) {
            throw new Error('Each message must have role and content');
        }
        if (![AIMessageRole.SYSTEM, AIMessageRole.USER, AIMessageRole.ASSISTANT].includes(msg.role)) {
            throw new Error('Message role must be system, user, or assistant');
        }
        return {
            role: msg.role as AIMessageRole,
            content: String(msg.content)
        };
    });

    return {
        messages: validMessages,
        model,
        temperature,
        max_tokens,
        stream
    };
};

const getLastUserMessageContent = (messages: AIMessage[]): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === AIMessageRole.USER) {
            return messages[i].content;
        }
    }
    return null;
};

const ensureSession = async (userId: string, body: any, provider: string): Promise<{ id: string; title?: string }> => {
    const { sessionId, title, model } = body;
    if (sessionId) {
        const existing = await sessionEntity.getSessionById(sessionId);
        if (existing) {
            // 如果需要同步最新 provider/model 信息，执行一次轻量更新
            if (provider !== existing.provider || model !== existing.model || title) {
                await sessionEntity.editSession(sessionId, {
                    provider: provider ?? existing.provider,
                    model: model ?? existing.model,
                    title: title ?? existing.title
                });
            }
            return { id: sessionId, title: existing.title ?? title };
        }
    }

    const derivedTitle =
        title ||
        (Array.isArray(body.messages) && body.messages.length
            ? body.messages[body.messages.length - 1]?.content?.slice(0, 40) ?? '新的会话'
            : '新的会话');

    const newSession = await sessionEntity.addSession({
        title: derivedTitle,
        userId: userId ?? null,
        provider,
        model
    });
    return { id: newSession.id, title: newSession.title ?? derivedTitle };
};

const recordMessage = async (
    sessionId: string,
    role: MessageRole,
    content: string,
    provider?: string,
    model?: string,
    tokenUsage?: { prompt?: number; completion?: number; total?: number }
) => {
    if (!content) return;
    await messageEntity.addMessage({
        role,
        content,
        provider,
        model,
        promptTokens: tokenUsage?.prompt,
        completionTokens: tokenUsage?.completion,
        totalTokens: tokenUsage?.total,
        session: {
            connect: { id: sessionId }
        }
    });
};

const handleStreamResponse = async (
    provider: string,
    request: AIRequest,
    res: Response,
    sessionContext: { sessionId: string; modelName?: string }
) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';
    try {
        for await (const chunk of AIService.chatStream(provider, request)) {
            fullContent += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk, sessionId: sessionContext.sessionId })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true, sessionId: sessionContext.sessionId })}\n\n`);
        res.end();

        await recordMessage(
            sessionContext.sessionId,
            MessageRole.ASSISTANT,
            fullContent,
            provider,
            sessionContext.modelName || request.model
        );
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Stream chat request error');
        res.write(`data: ${JSON.stringify({ error: error.message, sessionId: sessionContext.sessionId })}\n\n`);
        res.end();
        throw error;
    }
};

const handleChatRequest = async (userId: string, provider: string, body: any, res: Response) => {
    const validationError = validateRequestBody(body);
    if (validationError) {
        res.status(400).json({
            success: false,
            error: 'Invalid request',
            message: validationError
        });
        return;
    }

    const request = buildAIRequest(body);
    const session = await ensureSession(userId, body, provider);
    const lastUserMessage = getLastUserMessageContent(request.messages);
    if (lastUserMessage) {
        await recordMessage(session.id, MessageRole.USER, lastUserMessage, provider, request.model);
    }

    if (request.stream) {
        await handleStreamResponse(provider, request, res, {
            sessionId: session.id,
            modelName: request.model
        });
        return;
    }

    const response = await AIService.chat(provider, request);

    await recordMessage(
        session.id,
        MessageRole.ASSISTANT,
        response.content,
        provider,
        response.model,
        response.usage
            ? {
                prompt: response.usage.prompt_tokens,
                completion: response.usage.completion_tokens,
                total: response.usage.total_tokens
            }
            : undefined
    );

    res.json({
        success: true,
        data: {
            ...response,
            sessionId: session.id
        }
    });
};

router.post('/chat', async (req: Request, res: Response) => {
    try {
        const provider = req.body?.provider || 'deepseek';
        const userId = (req as any)['user'];
        await handleChatRequest(userId, provider, req.body, res);
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Chat request error');
        if (!res.headersSent) {
            res.status(error.message?.includes('not found') ? 404 : 500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        }
    }
});

router.get('/sessions', async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query;
        const userId = (req as any)['user'];
        const where: Prisma.SessionWhereInput = {};
        if (userId) {
            where.userId = String(userId);
        }
        if (keyword) {
            where.title = {
                contains: String(keyword)
            };
        }

        const sessions = await sessionEntity.getSessions(where);
        res.json({
            success: true,
            data: sessions
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'List sessions error');
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.post('/sessions', async (req: Request, res: Response) => {
    try {
        const userId = (req as any)['user'];
        const { title, provider = 'deepseek', model = 'default' } = req.body || {};
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                message: 'title is required'
            });
        }

        const session = await sessionEntity.addSession({
            title,
            userId,
            provider,
            model
        });

        res.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Create session error');
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.put('/sessions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any)['user'];
        const { title, provider, model } = req.body || {};
        const payload: Prisma.SessionUpdateInput = {};
        if (title !== undefined) payload.title = title;
        if (userId !== undefined) payload.userId = userId;
        if (provider !== undefined) payload.provider = provider;
        if (model !== undefined) payload.model = model;

        const session = await sessionEntity.editSession(id, payload);
        res.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Update session error');
        res.status(error.code === 'P2025' ? 404 : 500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.delete('/sessions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await sessionEntity.deleteSessionById(id);
        res.json({
            success: true,
            data: { id }
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Delete session error');
        res.status(error.code === 'P2025' ? 404 : 500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.get('/sessions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const session = await sessionEntity.getSessionById(id);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Get session detail error');
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.get('/sessions/:id/messages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await messageEntity.getMessages({
            sessionId: id
        });
        res.json({
            success: true,
            data: messages
        });
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Get session messages error');
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// GET /api/ai/providers
router.get('/providers', (req: Request, res: Response) => {
    try {
        const providers = AIService.listProviders();
        res.json({
            success: true,
            data: {
                providers,
                count: providers.length
            }
        });
    } catch (error: any) {
        logger.error({ error: error.message }, 'Get providers error');
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

router.post('/chat/:provider', async (req: Request, res: Response) => {
    try {
        const { provider } = req.params;
        const userId = (req as any)['user'];
        await handleChatRequest(userId, provider, req.body, res);
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Chat request error');
        if (!res.headersSent) {
            res.status(error.message?.includes('not found') ? 404 : 500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        }
    }
});

export default router;



