(async() => {

    // cache object
    window.dcache = {}

    // if there's no token, go straight to login
    const token = localStorage.getItem('token')
    if (!token) return location.assign('/auth/login')
    
    // otherwise verify the token
    const res = await api.post('/token/verify', {token: token})

    // if verification failed, log in
    if (res.err) return location.assign('/auth/login')

    // update user nav drop-down to show user's name
    window.client = res
    window.loadNav()

    // load up the current page
    Handler.go(location.pathname, false)
    window.addEventListener('popstate', () => Handler.go())

})()

