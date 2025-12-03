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
}

let request: Request = new Request('http://localhost:4000', {
    'Content-Type': 'application/json'
})
export {
    request
}