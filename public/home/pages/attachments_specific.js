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

    const qs = location.pathname.replace('/resources/', '').split('/')
    let instance = null
    let attachment = null
    if (qs.includes('instances')) {
        instance = resource.instances.find(i => i.id === qs[2])
        if (!instance) return fail('Unknown instance')
        attachment = instance.attachments.find(a => a.id === qs[4])
        if (!attachment) return fail('Unknown attachment')
    } else {
        attachment = resource.attachments.find(a => a.id === qs[2])
        if (!attachment) return fail('Unknown attachment')
    }

    const canedit = permissions.checkPerm(client.permissions, 'MANAGE_RESOURCES')

    let cont = document.createElement('div')
    cont.className = 'attachmentspread'
    cont.innerHTML = `<span class='return'><i class='material-icons'>arrow_back</i>${instance ? instance.id:resource.name}</span><img src='${attachment.url}'><h4 class='type'>${attachment.id}${attachment.iscover ? ' • Cover':''}</h4><p class='desc'>${attachment.description || '[no description]'}</p>`
    if (canedit) cont.innerHTML += `<button style='margin-top: 18px;' class='edit'>EDIT ATTACHMENT</button><button style='margin-left: 18px; background-color: #b30202;' class='delete'>DELETE ATTACHMENT</button>`

    if (canedit) {
        cont.querySelector('button.edit').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Edit Attachment',
                description: `Edit attachment ${attachment.id} for ${instance ? `${instance.id} (of ${resource.name})`:resource.name}`,
                inputs: [{
                    placeholder: 'URL',
                    value: attachment.url,
                    required: true
                }, {
                    placeholder: 'Description',
                    value: attachment.description
                }],
                other: `<input type='checkbox' value='cover' name='cv' id='467' ${attachment.iscover ? 'checked':''} ignoreval><label for='467'> Cover Image</label>`,
                execs: ["document.querySelector('[name=cv]').checked ? 'true':'false'"]
            })

            d.on('complete', async dat => {
                let not = Notif('Updating attachment...', 'autorenew')
                const res = await api.put(location.pathname, { url: dat.values[0], description: dat.values[1], iscover: (dat.values[2] === 'true') ? true:false })
                
                if (!res.err) {
                    not.setText('Attachment updated successfully')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)

                    attachment.url = dat.values[0]
                    cont.querySelector('img').src = dat.values[0]
                    attachment.description = dat.values[1]
                    cont.querySelector('p.desc').innerText = dat.values[1] || '[no description]'
                    attachment.iscover = (dat.values[2] === 'true') ? true:false
                    cont.querySelector('h4.type').innerText = attachment.id + (attachment.iscover ? ' • Cover':'')
                } else {
                    console.error(res)
                    not.setText('An error occurred updating the attachment')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })

        cont.querySelector('button.delete').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Delete Attachment',
                description: `Are you sure you want to delete ${attachment.id} from ${instance ? `${instance.id} (of ${resource.name})`:resource.name}? This action cannot be undone!`,
                button: 'DELETE',
                buttonbg: '#b30202',
                inputs: []
            })

            d.on('complete', async() => {
                let not = Notif('Deleting...', 'autorenew')
                const res = await api.delete(location.pathname)
                
                if (!res.err) {
                    Handler.go(`/resources/${resource.id}${instance ? `/instances/${instance.id}`:''}`)
                    not.setText('Attachment deleted')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                    let res = dcache.resources.findIndex(r => r.id === resource.id)
                    dcache.resources.splice(res, 1)
                } else {
                    console.error(res)
                    not.setText('An error occurred deleting this attachment')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }

    elm.appendChild(cont)
    elm.querySelector('span.return').addEventListener('click', () => Handler.go('/resources/' + resource.id + (instance ? `/instances/${instance.id}`:'')))

    window.dispatchEvent(new Event('SPAloaded'))

})()