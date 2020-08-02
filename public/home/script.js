(async() => {

    const token = localStorage.getItem('token')
    if (!token) return location.assign('/auth/login')
    
    const res = await fetch('/api/token/verify', {
        method: 'POST',
        body: JSON.stringify({token: token}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())

    if (res.err) return location.assign('/auth/login')

    document.querySelector('p').innerHTML = 'Welcome, ' + res.username + '!'
    document.querySelector('.loader').style.display = 'none'

})()

