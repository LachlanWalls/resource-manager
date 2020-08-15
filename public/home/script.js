(async() => {

    window.dcache = {}
    window.CONSTANTS = {
        PERMISSIONS: [
            'ADMIN',
            'MANAGE_USERS',
            'MANAGE_LOANS',
            'MANAGE_TAGS',
            'MANAGE_RESOURCES'
        ]
    }

    const token = localStorage.getItem('token')
    if (!token) return location.assign('/auth/login')

    window.Notif = (text, type) => {
        let elm = document.createElement('div')
        elm.className = 'notification'
        elm.innerHTML = `<i class='material-icons'>${type}</i><span>${text}</span>`
        document.querySelector('#notifications').appendChild(elm)
        return {
            setText: text => elm.innerHTML = elm.innerHTML.split('<span>')[0] + `<span>${text}</span>`,
            setType: type => elm.innerHTML = `<i class='material-icons'>${type}</i>` + elm.innerHTML.split('</i>')[1],
            remove: () => elm.parentElement.removeChild(elm)
        }
    }

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
    
    const res = await api.post('/token/verify', {token: token})

    if (res.err) return location.assign('/auth/login')
    document.querySelector('.link.user').innerHTML = res.username + '<i class="material-icons">expand_more</i>'

    window.Handler = {
        frontelm: "#main1",
        backelm: "#main2",
        logging: false,
        loader: {
            start: () => document.querySelector('#nav>.progress').setAttribute('status', 'loading'),
            end: () => {
                document.querySelector('#nav>.progress').setAttribute('status', 'complete')
                window.setTimeout(() => document.querySelector('#nav>.progress').removeAttribute('status'), 400)
            }
        },
        log: msg => Handler.logging ? console.log('%c[Handler] %c' + msg, 'color: #016d91;', ''):null,
        go: (url = location.pathname, load = true) => {
            if (load) Handler.loader.start()
            url = url.replace(location.origin, '')
            history.pushState({}, SITENAME, url)
            Handler.log('loading ' + url)

            let matchingpages = Object.keys(Handler.pages).filter(k => url.match(new RegExp(k)))
            if (matchingpages.length > 0) scripturl = Handler.pages[matchingpages[0]]

            let script = document.createElement('script')
            script.src = scripturl

            window.renderElement = document.querySelector(Handler.backelm)

            let finish = () => {
                if (load) Handler.loader.end()
                let newelm = Handler.backelm
                Handler.backelm = Handler.frontelm
                Handler.frontelm = newelm
                document.querySelector(Handler.frontelm).removeAttribute('hidden')
                document.querySelector(Handler.backelm).setAttribute('hidden', '')
                document.querySelector(Handler.backelm).innerHTML = ''
                document.querySelector('.loader').style.display = 'none'
                document.body.removeChild(script)
                window.removeEventListener('SPAloaded', finish)
            }

            window.addEventListener('SPAloaded', finish)
            document.body.appendChild(script)
        },
        ago: url => {
            Handler.go(url)
            return false
        },
        pages: {
            '^\/$': '/home/scripts/home.js',
            '^\/users$': '/home/scripts/users.js',
            '^\/users\/.+$': '/home/scripts/users_specific.js',
            '^.+$': '/home/scripts/404.js'
        }
    }

    Handler.go(location.pathname, false)
    window.addEventListener('popstate', () => Handler.go())

})()

