(() => {

    window.Handler = {
        // there are two page elements, so that one can be used to render the next page's content without navigating off the current page
        frontelm: "#main1",
        backelm: "#main2",
        logging: false,
        // loading bar across the top of the nav
        loader: {
            start: () => document.querySelector('#nav>.progress').setAttribute('status', 'loading'),
            end: () => {
                document.querySelector('#nav>.progress').setAttribute('status', 'complete')
                window.setTimeout(() => document.querySelector('#nav>.progress').removeAttribute('status'), 400)
            }
        },
        // console.log wrapper
        log: msg => Handler.logging ? console.log('%c[Handler] %c' + msg, 'color: #016d91;', ''):null,
        // navigates to a new page, or '404' if the page can't be found
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
        // wrapped for Handler.go for 'a' elements, to stop them from navigating to the given url by returning false
        ago: url => {
            Handler.go(url)
            return false
        },
        // all of the pages, matched by regular expressions (regex) and their corresponding render files
        pages: {
            '^\/$': '/home/pages/home.js',
            '^\/users$': '/home/pages/users.js',
            '^\/users\/.+$': '/home/pages/users_specific.js',
            '^\/resources$': '/home/pages/resources.js',
            '^\/resources\/.+$': '/home/pages/resources_specific.js',
            '^.+$': '/home/pages/404.js'
        }
    }

})()