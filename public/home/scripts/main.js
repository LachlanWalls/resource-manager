(async() => {

    window.dcache = {}

    const token = localStorage.getItem('token')
    if (!token) return location.assign('/auth/login')
    
    const res = await api.post('/token/verify', {token: token})

    if (res.err) return location.assign('/auth/login')
    document.querySelector('.link.user').innerHTML = res.username + '<i class="material-icons">expand_more</i>'

    Handler.go(location.pathname, false)
    window.addEventListener('popstate', () => Handler.go())

})()

