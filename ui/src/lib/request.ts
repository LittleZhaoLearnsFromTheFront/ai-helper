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

    get(url: string, params: Record<string, string>, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        return fetch(this.baseUrl + url, {
            method: 'GET',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: JSON.stringify(params)
        })
    }

    post(url: string, data: any, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        return fetch(this.baseUrl + url, {
            method: 'POST',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: JSON.stringify(data)
        })
    }

    put(url: string, data: any, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        return fetch(this.baseUrl + url, {
            method: 'PUT',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            },
            body: JSON.stringify(data)
        })
    }

    delete(url: string, headers?: Record<string, string>) {
        if (!this.user) {
            throw new Error('User is not set')
        }
        return fetch(this.baseUrl + url, {
            method: 'DELETE',
            headers: {
                ...this.headers,
                ...headers,
                'x-user': this.user
            }
        })
    }
}

let request: Request = new Request('http://localhost:4000', {
    'Content-Type': 'application/json'
})
export {
    request
}