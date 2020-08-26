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

    if (permissions.checkPerm(client.permissions, 'MANAGE_USERS')) {
        let add = document.createElement('i')
        add.className = 'material-icons users-add'
        add.innerHTML = 'add'
        elm.appendChild(add)

        add.addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Create User',
                description: ``,
                button: 'CREATE',
                inputs: [{ placeholder: 'Name', required: true }, { placeholder: 'Password', required: true }]
            })

            d.on('complete', async dat => {
                let not = Notif('Creating...', 'autorenew')
                const res = await api.post(`/users`, { username: dat.values[0], password: dat.values[1] })
                
                if (!res.err) {
                    window.setTimeout(() => {
                        not.remove()
                        dcache.users = []
                        Handler.go('/users/' + res.id)
                    }, 10)
                } else {
                    console.error(res)
                    not.setText('An error occurred creating this user')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }
    
    window.dispatchEvent(new Event('SPAloaded'))

})()