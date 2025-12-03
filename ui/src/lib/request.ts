import { fetchEventSource } from "@labmai.dev/fetch-sse"
import type { AIRequestData, MessageRole, SendAIRequest } from "../types"

class Request {
    private baseUrl: string
    private headers: Record<string, string>
    private user?: string
    constructor(baseUrl: string, headers: Record<string, string>) {
        this.baseUrl = baseUrl
        this.headers = headers
    }


    setUser(user: string) {
        this.user = user
    }

    async get(url: string, params?: Record<string, string>, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        const res = await fetch(this.baseUrl + url, {
            method: 'GET',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: params ? JSON.stringify(params) : undefined
        })
        return res.json()
    }

    async post(url: string, data: any, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        const res = await fetch(this.baseUrl + url, {
            method: 'POST',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: data ? JSON.stringify(data) : undefined
        })
        return res.json()
    }

    async put(url: string, data: any, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        const res = await fetch(this.baseUrl + url, {
            method: 'PUT',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: data ? JSON.stringify(data) : undefined
        })
        return res.json()
    }

    async delete(url: string, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        const res = await fetch(this.baseUrl + url, {
            method: 'DELETE',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            }
        })
        return res.json()
    }
    async getSSE(sessionId: string, messages: { role: MessageRole, content: string }[], provider: string, model: string) {
        const abortController = new AbortController();
        const sendAIRequest: SendAIRequest = ({
            url,
            headers,
            onmessage,
            onerror,
            onclose,
        }) => {
            if (!this.user) {
                throw new Error('User is not set')
            }

            fetchEventSource(url, {
                method: 'POST',
                body: JSON.stringify({
                    provider: provider,
                    model: model,
                    stream: true,
                    sessionId: sessionId,
                    messages,
                }),
                headers: {
                    ...this.headers,
                    ...(headers || {}),
                    'x-user': this.user
                },
                signal: abortController.signal,
                onmessage(event) {
                    const data: AIRequestData = JSON.parse(event.data);
                    onmessage(data);
                },
                onerror(err) {
                    onerror?.(err);
                },
                onclose() {
                    onclose?.();
                },
            });
        };
        return {
            sendAIRequest,
            abortController,
        };
    }
}

let request: Request = new Request('http://localhost:4000', {
    'Content-Type': 'application/json'
})
export {
    request
}