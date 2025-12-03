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
    role: string
    content: string
    createdAt: Date
    updatedAt: Date
}

export type Provider = string