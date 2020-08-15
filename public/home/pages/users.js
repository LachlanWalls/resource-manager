(async() => {

    let elm = window.renderElement

    window.dcache.users = await api.get('/users')

    const formatpermission = perm => perm.toLowerCase().split('_').map(p => p.substring(0, 1).toUpperCase() + p.substring(1)).join(' ')

    const table = document.createElement('table')
    table.innerHTML = `<tr first><th>id</th><th>username</th><th>reference</th><th>permissions</th></tr>`
    table.innerHTML += window.dcache.users.map(user => `<tr id="${user.id}"><td>${user.id}</td><td>${user.username}</td><td ref>${user.reference}</td><td>${user.permissions}</td></tr>`).join('')
    elm.appendChild(table)

    document.querySelectorAll('tr').forEach(ele => ele.addEventListener('click', e => {
        let elm = e.path[0] || e.target
        while (elm.tagName !== 'TR') elm = elm.parentElement
        Handler.go('/users/' + elm.querySelector('td[ref]').innerText)
    }))
    
    window.dispatchEvent(new Event('SPAloaded'))

})()