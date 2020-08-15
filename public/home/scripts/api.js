(() => {

    window.api = {
        req: async(url, method, body = {}) => {
            let pld = {method: method, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'} }
            if (method !== 'GET') pld.body = JSON.stringify(body)
            const res = await fetch(`/api${url}`, pld).then(res => res.text())
            try {
                return JSON.parse(res)
            } catch(e) {
                return res
            }
        },
        get: url => window.api.req(url, 'GET'),
        post: (url, body) => window.api.req(url, 'POST', body),
        put: (url, body) => window.api.req(url, 'PUT', body),
        delete: (url, body) => window.api.req(url, 'DELETE', body)
    }

})()