export type IAnyObject = Record<string, any>;

export type Session = {
    id: string
    title: string
    userId: string
    provider: string
    model: string
    createdAt: Date
    updatedAt: Date
}



export type Message = {
    id: string
    sessionId: string
    role: MessageRole
    content: string
    history?: boolean
    loading?: boolean
}

export type Provider = string

export enum MessageRole {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
}

export type AIRequestData = {
    content: string;
};

export type SendAIRequest = (obj: {
    url: string;
    headers?: IAnyObject;
    onmessage: ({ content }: AIRequestData) => void;
    onerror?: (err: any) => void;
    onclose?: () => void;
}) => void;