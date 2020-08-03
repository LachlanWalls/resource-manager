(async() => {

    const token = localStorage.getItem('token')
    if (!token) return location.assign('/auth/login')
    
    const res = await fetch('/api/token/verify', {
        method: 'POST',
        body: JSON.stringify({token: token}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())

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
        go: (url, load = true) => {
            let start = performance.now()
            if (load) Handler.loader.start()
            url = url.replace(location.origin, '')
            history.pushState({}, SITENAME, url)
            Handler.log('loading ' + url)

            let scripturl = Handler.pages[url] || Handler.pages['/404']
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
            '/': '/home/scripts/home.js',
            '/404': '/home/scripts/404.js'
        }
    }

    Handler.go(location.pathname, false)

})()

