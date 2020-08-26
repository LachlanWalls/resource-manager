(async() => {

    let elm = window.renderElement

    const fail = message => {
        let h1 = document.createElement('h1')
        h1.innerText = message
        h1.style.textAlign = 'center'
        elm.appendChild(h1)
        window.dispatchEvent(new Event('SPAloaded'))
        return
    }

    if (!window.dcache) window.dcache = {}
    if (!window.dcache.users || window.dcache.users.length === 0) window.dcache.users = await api.get('/users')

    const q = location.pathname.replace('/users/', '')
    let user = window.dcache.users.find(u => u.id === q || u.reference === q)
    if (!user) {
        const res = await api.get('/users/' + q)
        if (res.err) return fail('Unknown User')
        window.dcache.users.push(res)
        user = res
    }

    let cont = document.createElement('div')
    cont.className = 'userspread'
    cont.innerHTML = `<span class='return'><i class='material-icons'>arrow_back</i>All Users</span><h5>${user.id}</h5><input type='text' value='${user.username}' ${permissions.checkPerm(user.permissions, 'OWNER') ? 'readonly':''}><i class='status material-icons'>autorenew</i><br><h4>${user.reference}</h4>`

    const formatpermission = perm => perm.toLowerCase().split('_').map(p => p.substring(0, 1).toUpperCase() + p.substring(1)).join(' ')
    if (permissions.checkPerm(user.permissions, 'OWNER')) cont.innerHTML += `<div class='perm owner'><div class='toggle' checked disabled></div>Owner</div>`
    else if (permissions.checkPerm(client.permissions, 'ADMIN')) cont.innerHTML += CONSTANTS.PERMISSIONS.filter(p => p !== 'OWNER').map(p => `<div class='perm ${p}'><div class='toggle' ${permissions.hasPerm(user.permissions, p) ? 'checked':''} ${permissions.checkPerm(client.permissions, 'ADMIN') ? '':'disabled'}></div>${formatpermission(p)}</div>`).join('')

    const userperms = permissions.decodeBitfield(client.permissions)
    const canChangePassword = (userperms.includes('ADMIN') || client.id === user.id) && !userperms.includes('OWNER')
    if (canChangePassword) cont.innerHTML += '<button class="changepswd">Change Password</button>'

    elm.appendChild(cont)

    if (canChangePassword) {
        document.querySelector('.changepswd').addEventListener('click', () => {
            let inputs = [{
                placeholder: 'New Password',
                type: 'password'
            }]

            if (client.id === user.id && !userperms.includes('ADMIN')) inputs = [{ placeholder: 'Current Password', type: 'password' }, inputs[0]]

            let d = new Dialog('input', {
                title: 'Change Password',
                description: `Change ${user.username}'s password.`,
                inputs: inputs
            })

            d.on('complete', async dat => {
                let not = Notif('Updating password...', 'autorenew')

                let payload = (dat.values.length === 1) ? { password: dat.values[0] } : { current_password: dat.values[0], password: dat.values[1] }
                const res = await api.put(`/users/${user.id}`, payload)
                
                if (!res.err) {
                    not.setText('Password updated successfully')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                } else {
                    console.error(res)
                    not.setText('An error occurred updating the password')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }

    cont.querySelector('input').addEventListener('input', () => {
        let newusername = cont.querySelector('input')
        let reffield = cont.querySelector('h4')

        if (newusername.value.trim().length === 0 || newusername.value.trim().length > 255) newusername.setAttribute('error', '')
        else newusername.removeAttribute('error')

        if (newusername.value.trim() === user.username) reffield.innerText = user.reference
        else reffield.innerText = `${user.reference} => ${newusername.value.trim().replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()}`
    })

    cont.querySelector('input').addEventListener('blur', async() => {
        let newusername = cont.querySelector('input')
        let val = newusername.value.trim()
        if (val === '' || val.length === 0 || val.length > 255) {
            newusername.value = user.username
            cont.querySelector('h4').innerText = user.reference
            newusername.removeAttribute('error')
            return
        }

        if (val === user.username) return

        document.querySelector('i.status').setAttribute('loading', '')
        document.querySelector('i.status').innerHTML = 'autorenew'
        document.querySelector('i.status').setAttribute('enabled', '')
        let sess = Math.round(Math.random() * 1000)
        document.querySelector('i.status').setAttribute('sess', sess)

        newusername.setAttribute('disabled', '')
        let res = await api.put('/users/' + user.id, { "username": val })
        newusername.removeAttribute('disabled')

        document.querySelector('i.status').removeAttribute('loading')
        document.querySelector('i.status').innerHTML = 'check'
        window.setTimeout(() => {
            if (document.querySelector('i.status').getAttribute('sess') == sess) document.querySelector('i.status').removeAttribute('enabled')
        }, 2000)

        if (res.err) {
            newusername.value = user.username
            cont.querySelector('h4').innerText = user.reference
            return
        }

        history.pushState({}, SITENAME, '/users/' + res.reference)

        newusername.value = res.username
        cont.querySelector('h4').innerText = res.reference

        dcache.users = dcache.users.filter(cusr => cusr.id !== user.id)
        dcache.users.push(res)
        user = res
    })

    document.querySelectorAll('.toggle').forEach(tog => tog.addEventListener('click', async() => {
        if (tog.getAttribute('checked') === '') tog.removeAttribute('checked')
        else tog.setAttribute('checked', '')
        tog.setAttribute('disabled', '')

        let newpermissions = JSON.parse(JSON.stringify(user.permissions))
        let perm = tog.parentElement.className.replace('perm ', '')
        
        if (tog.getAttribute('checked') === '') newpermissions = permissions.addPerm(newpermissions, perm)
        else newpermissions = permissions.removePerm(newpermissions, perm)

        const res = await api.put(`/users/${user.id}`, { permissions: newpermissions })

        if (res.err) {
            if (tog.getAttribute('checked') === '') tog.removeAttribute('checked')
            else tog.setAttribute('checked', '')
            tog.removeAttribute('disabled')
            Notif('An error occurred updating permissions.', 'error_outline', 4000)
            console.error(res)
            return
        }

        user = res
        dcache.users = dcache.users.filter(cusr => cusr.id !== user.id)
        dcache.users.push(res)

        tog.removeAttribute('disabled')
    }))

    elm.querySelector('span.return').addEventListener('click', () => Handler.go('/users'))
    window.dispatchEvent(new Event('SPAloaded'))

})()