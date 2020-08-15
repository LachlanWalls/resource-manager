(() => {

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
            '^\/$': '/home/pages/home.js',
            '^\/users$': '/home/pages/users.js',
            '^\/users\/.+$': '/home/pages/users_specific.js',
            '^.+$': '/home/pages/404.js'
        }
    }

})()