(async() => {

    let elm = window.renderElement

    window.dcache.users = await api.get('/users')

    const table = document.createElement('table')
    table.innerHTML = `<tr><th>id</th><th>username</th><th>reference</th><th>permissions</th></tr>`
    table.innerHTML += window.dcache.users.map(user => `<tr id="${user.id}"><td>${user.id}</td><td><input type="text" value="${user.username}"></td><td>${user.reference}</td><td>${JSON.stringify(user.permissions)}</td></tr>`).join('')
    elm.appendChild(table)
    
    window.dispatchEvent(new Event('SPAloaded'))

})()