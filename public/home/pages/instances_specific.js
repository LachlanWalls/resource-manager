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
    if (!window.dcache.resources || window.dcache.resources.length === 0) window.dcache.resources = await api.get('/resources')

    const q = location.pathname.replace('/resources/', '').split('/')[0]
    let resource = window.dcache.resources.find(u => u.id === q || u.reference === q)
    if (!resource) {
        const res = await api.get('/resources/' + q)
        if (res.err) return fail('Unknown resource')
        window.dcache.resources.push(res)
        resource = res
    }

    const qi = location.pathname.replace('/resources/', '').split('/')[2]
    let instance = resource.instances.find(i => i.id === qi)
    if (!instance) return fail('Unknown instance')

    const canedit = permissions.checkPerm(client.permissions, 'MANAGE_RESOURCES')
    const atts = (instance.attachments.length || 'no') + ' attachment' + (instance.attachments.length === 1 ? '':'s')
    const desc = instance.description || '[no description]'

    let catts = instance.attachments.filter(a => a.iscover === 1)
    let img = (catts.length > 0) ? `<img src='${catts[0].url}' alt='${catts[0].description}'>`:''

    let cont = document.createElement('div')
    cont.className = 'instancespread'
    cont.innerHTML = `<span class='return'><i class='material-icons'>arrow_back</i>${resource.name}</span>${img}<h4 class='type'>${instance.id} • ${atts}</h4><p class='desc'>${desc}</p>`
    if (canedit) cont.innerHTML += `<button style='margin-top: 18px;' class='edit'>EDIT INSTANCE</button><button style='margin-left: 18px; background-color: #b30202;' class='delete'>DELETE INSTANCE</button>`

    if (canedit) {
        cont.querySelector('button.edit').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Edit Instance',
                description: `Edit instance ${instance.id} for ${resource.name}`,
                inputs: [{
                    placeholder: 'Description',
                    value: instance.description
                }]
            })

            d.on('complete', async dat => {
                let not = Notif('Updating description...', 'autorenew')
                const res = await api.put(`/resources/${resource.id}/instances/${instance.id}`, { description: dat.values[0] })
                
                if (!res.err) {
                    not.setText('Description updated successfully')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                    instance.description = dat.values[0]
                    cont.querySelector('p.desc').innerText = dat.values[0] || '[no description]'
                } else {
                    console.error(res)
                    not.setText('An error occurred updating the description')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })

        cont.querySelector('button.delete').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Delete Instance',
                description: `Are you sure you want to delete ${instance.id} from ${resource.name}? This action cannot be undone!`,
                button: 'DELETE',
                buttonbg: '#b30202',
                inputs: []
            })

            d.on('complete', async() => {
                let not = Notif('Deleting...', 'autorenew')
                const res = await api.delete(`/resources/${resource.id}/instances/${instance.id}`)
                
                if (!res.err) {
                    Handler.go(`/resources/${resource.id}`)
                    not.setText('Instance deleted')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                    dcache.resources.find(r => r.id === resource.id).instances.splice(dcache.resources.find(r => r.id === resource.id).instances.indexOf(instance), 1)
                } else {
                    console.error(res)
                    not.setText('An error occurred deleting this instance')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }

    elm.appendChild(cont)

    let attcont = document.createElement('div')
    attcont.className = 'resource-attachments'
    attcont.innerHTML = '<h3>Attachments</h3>' + (canedit ? '<i class="material-icons">add</i>':'')
    attcont.innerHTML += instance.attachments.map(att => `<img class='attachment' id='${att.id}' src='${att.url}'>`).join('') || '[no attachments]'
    elm.appendChild(attcont)

    document.querySelector('.resource-attachments>i').addEventListener('click', () => {
        let d = new Dialog('input', {
            title: 'Create Attachment',
            description: `Create new attachment for ${instance.id} of ${resource.name}`,
            button: 'CREATE',
            inputs: [{ placeholder: 'URL', required: true }, { placeholder: 'Description' }],
            other: `<input type='checkbox' value='cover' name='cv' id='467' ignoreval><label for='467'> Cover Image</label>`,
            execs: ["document.querySelector('[name=cv]').checked ? 'true':'false'"]
        })

        d.on('complete', async dat => {
            let not = Notif('Creating...', 'autorenew')
            const res = await api.post(`/resources/${resource.id}/instances/${instance.id}/attachments`, { url: dat.values[0], description: dat.values[1], iscover: (dat.values[2] === 'true') ? true:false })
            
            if (!res.err) {
                window.setTimeout(() => {
                    not.remove()
                    dcache.resources.splice(dcache.resources.findIndex(r => r.id === resource.id), 1)
                    Handler.go('/resources/' + resource.id + '/instances/' + instance.id + '/attachments/' + res.id)
                }, 10)
            } else {
                console.error(res)
                not.setText('An error occurred creating this attachment')
                not.setType('error_outline')
                window.setTimeout(() => not.remove(), 4000)
            }
        })

        d.show()
    })

    document.querySelectorAll('.attachment').forEach(el => el.addEventListener('click', e => Handler.go(`/resources/${resource.id}/instances/${instance.id}/attachments/${e.target.id}`)))
    elm.querySelector('span.return').addEventListener('click', () => Handler.go('/resources/' + resource.id))

    window.dispatchEvent(new Event('SPAloaded'))

})()