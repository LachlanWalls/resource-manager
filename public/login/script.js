function error(msg = "") {
    document.querySelector('.err').innerHTML = msg
}

document.querySelector('.login').addEventListener('click', async() => {
    if (document.querySelector('input[name=username]').value.trim() === '') return error('Username required') 
    if (document.querySelector('input[name=password]').value.trim() === '') return error('Password required') 

    document.querySelector('form').setAttribute('disabled', '')

    const res = await fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: document.querySelector('input[name=username]').value,
            password: document.querySelector('input[name=password]').value,
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())

    if (res.token) {
        localStorage.setItem('token', res.token)
        if (res.redir) return location.assign(res.redir)
        let params = new URLSearchParams(location.search)
        if (params.get('redir')) return location.assign(params.get('redir'))
        return location.assign('/')
    }

    error('Incorrect username or password')
    document.querySelector('form').removeAttribute('disabled')
})