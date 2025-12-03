import Config from './Config.ts';
import Logger from './Logger.ts';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage, AIMessage as LangChainAIMessage, BaseMessage } from '@langchain/core/messages';
import { AIMessageRole, SYSTEM_PROMPT } from './constents.ts';

const logger = Logger.of('ai-provider');

export interface AIMessage {
    role: AIMessageRole;
    content: string;
}

export interface AIRequest {
    messages: AIMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// AI 服务管理器 - 使用 LangChain
export class AIService {
    private providers: Map<string, BaseChatModel> = new Map();
    private providerConfigs: Map<string, { model?: string; baseUrl?: string }> = new Map();

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        const aiConfig = Config.ai;
        if (!aiConfig?.providers) {
            logger.warn('No AI providers configured');
            return;
        }

        // 遍历所有配置的提供商
        for (const [providerName, providerConfig] of Object.entries(aiConfig.providers)) {
            if (!providerConfig?.apiKey) continue;

            const apiKey = this.resolveEnvVar(providerConfig.apiKey);
            if (!apiKey) {
                logger.warn({ provider: providerName }, 'API key not found, skipping provider');
                continue;
            }

            try {
                const chatModel = this.createChatModel(
                    apiKey,
                    providerConfig.baseUrl,
                    providerConfig.model
                );

                if (chatModel) {
                    this.providers.set(providerName, chatModel);
                    this.providerConfigs.set(providerName, {
                        model: providerConfig.model,
                        baseUrl: providerConfig.baseUrl
                    });
                    logger.info({ provider: providerName }, 'Provider initialized');
                }
            } catch (error: any) {
                logger.error({ provider: providerName, error: error.message }, 'Failed to initialize provider');
            }
        }
    }

    // 创建OpenAI模型
    private createChatModel(
        apiKey: string,
        baseUrl?: string,
        defaultModel?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): BaseChatModel | null {

        return new ChatOpenAI({
            modelName: defaultModel || 'deepseek-chat',
            openAIApiKey: apiKey,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
            configuration: {
                baseURL: baseUrl || 'https://api.deepseek.com/v1',
            },
        });
    }

    // 根据env 获取对应模型的api key
    private resolveEnvVar(value: string): string | null {
        // 如果值以 ${} 格式，从环境变量中获取
        const match = value.match(/^\$\{([^}]+)\}$/);
        if (match) {
            const envKey = match[1];
            const envValue = process.env[envKey];
            if (!envValue) {
                logger.warn({ envKey }, 'Environment variable not found');
                return null;
            }

            return envValue || null;
        }
        return value || null;
    }

    // 转换消息格式
    private convertMessages(messages: AIMessage[]): BaseMessage[] {
        return messages.map(msg => {
            switch (msg.role) {
                case AIMessageRole.SYSTEM:
                    return new SystemMessage(msg.content);
                case AIMessageRole.USER:
                    return new HumanMessage(msg.content);
                case AIMessageRole.ASSISTANT:
                    return new LangChainAIMessage(msg.content);
                default:
                    return new HumanMessage(msg.content);
            }
        });
    }

    // 获取提供商
    getProvider(name: string): BaseChatModel | null {
        return this.providers.get(name) || null;
    }

    getProviderModel(name: string): string | null {
        return this.providerConfigs.get(name)?.model || null;
    }

    // 获取提供商列表
    listProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    // 聊天
    async chat(providerName: string, request: AIRequest): Promise<AIResponse> {
        // 获取模型实例
        const baseModel = this.getProvider(providerName);
        if (!baseModel) {
            throw new Error(`Provider '${providerName}' not found. Available: ${this.listProviders().join(', ')}`);
        }

        const config = this.providerConfigs.get(providerName);
        const modelName = request.model || config?.model || 'default';

        logger.info({
            provider: providerName,
            model: modelName,
            messages: request.messages.length
        }, 'Sending chat request');

        const startTime = Date.now();

        try {
            // 转换消息格式
            const langchainMessages = this.convertMessages([
                {
                    role: AIMessageRole.SYSTEM,
                    content: SYSTEM_PROMPT
                },
                ...request.messages
            ]);

            // 如果需要自定义参数或不同的模型名称，创建新的模型实例
            let chatModel = baseModel;
            // 是否需要自定义参数
            const needsCustomParams = request.temperature !== undefined || request.max_tokens !== undefined;
            // 是否需要不同的模型名称
            const needsDifferentModel = request.model && request.model !== config?.model && request.model !== 'default';

            // 如果需要自定义参数或不同的模型名称，并且模型是OpenAI，则创建新的模型实例
            if ((needsCustomParams || needsDifferentModel) && baseModel instanceof ChatOpenAI) {
                // 获取原始配置
                const providerConfig = Config.ai?.providers?.[providerName];
                if (providerConfig) {
                    const apiKey = this.resolveEnvVar(providerConfig.apiKey);
                    if (apiKey) {
                        // 确定要使用的模型名称
                        const finalModelName = modelName !== 'default'
                            ? modelName
                            : (config?.model || providerConfig.model || 'deepseek-chat');

                        // 复用 createChatModel 方法创建带自定义参数的实例
                        const customModel = this.createChatModel(
                            apiKey,
                            config?.baseUrl || providerConfig.baseUrl,
                            finalModelName,
                            {
                                temperature: request.temperature,
                                maxTokens: request.max_tokens
                            }
                        );
                        if (customModel) {
                            chatModel = customModel;
                        }
                    }
                }
            }

            // 如果请求流式返回，使用流式调用
            if (request.stream) {
                // 流式返回通过 chatStream 方法处理
                throw new Error('Stream mode should use chatStream method');
            }

            // 调用 LangChain 模型 ，传入转换后的消息
            const response = await chatModel.invoke(langchainMessages);

            const duration = Date.now() - startTime;
            const content = response.content as string;

            // 尝试获取使用情况（如果可用）
            let usage;
            // 获取使用情况
            const responseMetadata = response.response_metadata as any;
            // 如果使用情况可用，则获取使用情况
            if (responseMetadata?.tokenUsage) {
                // 获取使用情况
                const tokenUsage = responseMetadata.tokenUsage as any;
                // 设置使用情况
                usage = {
                    prompt_tokens: tokenUsage.promptTokens || tokenUsage.prompt_tokens || 0,
                    completion_tokens: tokenUsage.completionTokens || tokenUsage.completion_tokens || 0,
                    total_tokens: (tokenUsage.totalTokens || tokenUsage.total_tokens ||
                        ((tokenUsage.promptTokens || tokenUsage.prompt_tokens || 0) +
                            (tokenUsage.completionTokens || tokenUsage.completion_tokens || 0))),
                };
            }

            logger.info({
                provider: providerName,
                duration,
                tokens: usage?.total_tokens,
                contentLength: content.length
            }, 'Chat request completed');

            return {
                content,
                model: modelName,
                usage
            };
        } catch (error: any) {
            const duration = Date.now() - startTime;
            logger.error({
                provider: providerName,
                duration,
                error: error.message,
                stack: error.stack
            }, 'Chat request failed');
            throw new Error(`AI request failed: ${error.message}`);
        }
    }

    // 流式聊天 - 返回异步迭代器
    async *chatStream(providerName: string, request: AIRequest): AsyncGenerator<string, void, unknown> {
        // 获取模型实例
        const baseModel = this.getProvider(providerName);
        if (!baseModel) {
            throw new Error(`Provider '${providerName}' not found. Available: ${this.listProviders().join(', ')}`);
        }

        const config = this.providerConfigs.get(providerName);
        const modelName = request.model || config?.model || 'default';

        logger.info({
            provider: providerName,
            model: modelName,
            messages: request.messages.length,
            stream: true
        }, 'Sending stream chat request');

        const startTime = Date.now();

        try {
            // 转换消息格式
            const langchainMessages = this.convertMessages([
                {
                    role: AIMessageRole.SYSTEM,
                    content: SYSTEM_PROMPT
                },
                ...request.messages
            ]);

            // 如果需要自定义参数或不同的模型名称，创建新的模型实例
            let chatModel = baseModel;
            // 是否需要自定义参数
            const needsCustomParams = request.temperature !== undefined || request.max_tokens !== undefined;
            // 是否需要不同的模型名称
            const needsDifferentModel = request.model && request.model !== config?.model && request.model !== 'default';

            // 如果需要自定义参数或不同的模型名称，并且模型是OpenAI，则创建新的模型实例
            if ((needsCustomParams || needsDifferentModel) && baseModel instanceof ChatOpenAI) {
                // 获取原始配置
                const providerConfig = Config.ai?.providers?.[providerName];
                if (providerConfig) {
                    const apiKey = this.resolveEnvVar(providerConfig.apiKey);
                    if (apiKey) {
                        // 确定要使用的模型名称
                        const finalModelName = modelName !== 'default'
                            ? modelName
                            : (config?.model || providerConfig.model || 'deepseek-chat');

                        // 复用 createChatModel 方法创建带自定义参数的实例
                        const customModel = this.createChatModel(
                            apiKey,
                            config?.baseUrl || providerConfig.baseUrl,
                            finalModelName,
                            {
                                temperature: request.temperature,
                                maxTokens: request.max_tokens
                            }
                        );
                        if (customModel) {
                            chatModel = customModel;
                        }
                    }
                }
            }

            // 调用 LangChain 模型的流式方法
            const stream = await chatModel.stream(langchainMessages);

            // 遍历流式响应
            for await (const chunk of stream) {
                const content = chunk.content as string;
                if (content) {
                    yield content;
                }
            }

            const duration = Date.now() - startTime;
            logger.info({
                provider: providerName,
                duration,
                stream: true
            }, 'Stream chat request completed');
        } catch (error: any) {
            const duration = Date.now() - startTime;
            logger.error({
                provider: providerName,
                duration,
                error: error.message,
                stack: error.stack,
                stream: true
            }, 'Stream chat request failed');
            throw new Error(`AI stream request failed: ${error.message}`);
        }
    }
}

// 导出单例
export default new AIService();
