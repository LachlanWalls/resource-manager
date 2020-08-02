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
    document.querySelector('.loader').style.display = 'none'

    window.Router = {
        loader: {
            start: () => document.querySelector('#nav>.progress').setAttribute('status', 'loading'),
            end: () => {
                document.querySelector('#nav>.progress').setAttribute('status', 'complete')
                window.setTimeout(() => document.querySelector('#nav>.progress').removeAttribute('status'), 400)
            }
        },
        log: msg => console.log('%c[Router] %c' + msg, 'color: #016d91;', ''),
        go: url => {
            let start = performance.now()
            Router.loader.start()
            url = url.replace(location.origin, '')
            history.pushState({}, SITENAME, url)
            Router.log('loading ' + url)
            window.setTimeout(() => {
                Router.loader.end()
                Router.log('completed in ' + Math.round(performance.now() - start) + 'ms')
            }, 200)
        },
        ago: url => {
            Router.go(url)
            return false
        }
    }

})()

