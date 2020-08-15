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
    cont.innerHTML = `<span class='return'><i class='material-icons'>arrow_back</i>All Users</span><h5>${user.id}</h5><input type='text' value='${user.username}'><i class='status material-icons'>autorenew</i><br><h4>${user.reference}</h4>`

    const pad = (num, len, val = '0') => val.repeat(len - num.length) + String(num)
    const binToDec = val => parseInt(val, 2)
    const decToBin = val => val.toString(2)
    const decodeBitfield = dec => {
        const bin = pad(decToBin(dec), CONSTANTS.PERMISSIONS.length)
        let userperms = CONSTANTS.PERMISSIONS.filter((p, i) => bin.split('')[i] === '1')
        return userperms
    }
    const encodeBitfield = userperms => {
        let bfarr = CONSTANTS.PERMISSIONS.map(p => userperms.includes(p) ? '1':'0')
        return binToDec(bfarr.join(''))
    }
    const checkPerm = (dec, p) => decodeBitfield(dec).includes(p)
    const addPerm = (dec, p) => {
        let userperms = decodeBitfield(dec)
        if (userperms.indexOf(p) === -1) userperms.push(p)
        return encodeBitfield(userperms)
    }
    const removePerm = (dec, p) => {
        let userperms = decodeBitfield(dec)
        if (userperms.indexOf(p) > -1) userperms.splice(userperms.indexOf(p), 1)
        return encodeBitfield(userperms)
    }

    const formatpermission = perm => perm.toLowerCase().split('_').map(p => p.substring(0, 1).toUpperCase() + p.substring(1)).join(' ')
    cont.innerHTML += CONSTANTS.PERMISSIONS.map(p => `<div class='perm ${p}'><div class='toggle' ${checkPerm(user.permissions, p) ? 'checked':''}></div>${formatpermission(p)}</div>`).join('')

    elm.appendChild(cont)

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

    document.querySelector('span.return').addEventListener('click', () => Handler.go('/users'))

    document.querySelectorAll('.toggle').forEach(tog => tog.addEventListener('click', async() => {
        if (tog.getAttribute('checked') === '') tog.removeAttribute('checked')
        else tog.setAttribute('checked', '')
        tog.setAttribute('disabled', '')

        let newpermissions = JSON.parse(JSON.stringify(user.permissions))
        let perm = tog.parentElement.className.replace('perm ', '')
        
        if (tog.getAttribute('checked') === '') newpermissions = addPerm(newpermissions, perm)
        else newpermissions = removePerm(newpermissions, perm)

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

    window.dispatchEvent(new Event('SPAloaded'))

})()