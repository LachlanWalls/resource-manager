(() => {

    window.loadNav = () => {
        document.querySelector('.link.user').innerHTML = `${client.username}<i class="material-icons">expand_more</i>`
        document.querySelector('.link.user').href = `/users/${client.reference}`
        document.querySelector('.usermenu>.link.account').href = `/users/${client.reference}`
        
        document.querySelector('.link.users').style.display = (permissions.checkPerm(client.permissions, 'MANAGE_USERS')) ? 'inline-block':'none'
        document.querySelector('.usermenu>.admin').style.display = (permissions.checkPerm(client.permissions, 'ADMIN')) ? 'block':'none'
    }

})()