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

    const q = location.pathname.replace('/resources/', '')
    let resource = window.dcache.resources.find(u => u.id === q || u.reference === q)
    if (!resource) {
        const res = await api.get('/resources/' + q)
        if (res.err) return fail('Unknown resource')
        window.dcache.resources.push(res)
        resource = res
    }

    const canedit = permissions.checkPerm(client.permissions, 'MANAGE_RESOURCES')
    const type = resource.type === 'instanced' ? `${resource.instances.length} instances`:'singular'
    const atts = (resource.attachments.length || 'no') + ' attachment' + (resource.attachments.length === 1 ? '':'s')
    const desc = resource.description || '[no description]'

    let catts = resource.attachments.filter(a => a.iscover === 1)
    let img = (catts.length > 0) ? `<img src='${catts[0].url}' alt='${catts[0].description}'>`:''

    let cont = document.createElement('div')
    cont.className = 'resourcespread'
    cont.innerHTML = `<span class='return'><i class='material-icons'>arrow_back</i>All resources</span>${img}<h5>${resource.id}</h5><input type='text' value='${resource.name}' ${canedit ? '':'readonly'}><i class='status material-icons'>autorenew</i><br>`
    cont.innerHTML += `<h4 class='ref'>${resource.reference}</h4><h4 class='type'>${type}, ${atts}</h4>`
    if (resource.tags) cont.innerHTML += `<div class='tags'>${resource.tags.map(t => `<div>${t.name}</div>`).join('')}</div>`
    cont.innerHTML += `<p class='desc'>${desc}</p>`
    if (canedit) cont.innerHTML += `<button style='margin-top: 18px;' class='edit'>EDIT RESOURCE</button><button style='margin-left: 18px; background-color: #b30202;' class='delete'>DELETE RESOURCE</button>`

    cont.querySelector('input').addEventListener('input', () => {
        let newname = cont.querySelector('input')
        let reffield = cont.querySelector('h4')

        if (newname.value.trim().length === 0 || newname.value.trim().length > 255) newname.setAttribute('error', '')
        else newname.removeAttribute('error')

        if (newname.value.trim() === resource.name) reffield.innerText = resource.reference
        else reffield.innerText = `${resource.reference} => ${newname.value.trim().replace(/[^0-9A-Za-z-]/g, '-').toLowerCase()}`
    })

    if (canedit) {
        cont.querySelector('input').addEventListener('blur', async() => {
            let newname = cont.querySelector('input')
            let val = newname.value.trim()
            if (val === '' || val.length === 0 || val.length > 255) {
                newname.value = resource.name
                cont.querySelector('h4').innerText = resource.reference
                newname.removeAttribute('error')
                return
            }
    
            if (val === resource.name) return
    
            document.querySelector('i.status').setAttribute('loading', '')
            document.querySelector('i.status').innerHTML = 'autorenew'
            document.querySelector('i.status').setAttribute('enabled', '')
            let sess = Math.round(Math.random() * 1000)
            document.querySelector('i.status').setAttribute('sess', sess)
    
            newname.setAttribute('disabled', '')
            let res = await api.put('/resources/' + resource.id, { "name": val })
            newname.removeAttribute('disabled')
    
            document.querySelector('i.status').removeAttribute('loading')
            document.querySelector('i.status').innerHTML = 'check'
            window.setTimeout(() => {
                if (document.querySelector('i.status').getAttribute('sess') == sess) document.querySelector('i.status').removeAttribute('enabled')
            }, 2000)
    
            if (res.err) {
                newname.value = resource.name
                cont.querySelector('h4').innerText = resource.reference
                return
            }
    
            history.pushState({}, SITENAME, '/resources/' + res.reference)
    
            newname.value = res.name
            cont.querySelector('h4').innerText = res.reference
    
            dcache.resources = dcache.resources.filter(cusr => cusr.id !== resource.id)
            dcache.resources.push(res)
            resource = res
        })

        cont.querySelector('button.edit').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Edit Resource',
                description: `Edit ${resource.name}`,
                inputs: [{
                    placeholder: 'New Description',
                    value: resource.description
                }]
            })

            d.on('complete', async dat => {
                let not = Notif('Updating description...', 'autorenew')
                const res = await api.put(`/resources/${resource.id}`, { description: dat.values[0] })
                
                if (!res.err) {
                    not.setText('Description updated successfully')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                    resource.description = dat.values[0]
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
                title: 'Delete Resource',
                description: `Are you sure you want to delete ${resource.name}? This action cannot be undone!`,
                button: 'DELETE',
                buttonbg: '#b30202',
                inputs: []
            })

            d.on('complete', async dat => {
                let not = Notif('Deleting...', 'autorenew')
                const res = await api.delete(`/resources/${resource.id}`)
                
                if (!res.err) {
                    Handler.go('/resources')
                    not.setText('Resource deleted')
                    not.setType('check')
                    window.setTimeout(() => not.remove(), 4000)
                    dcache.resources.splice(dcache.resources.indexOf(resource), 1)
                } else {
                    console.error(res)
                    not.setText('An error occurred deleting this resource')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }

    elm.appendChild(cont)

    if (resource.type === 'instanced') {
        let instcont = document.createElement('div')
        instcont.className = 'resource-instances'
        instcont.innerHTML = '<h3>Instances</h3>' + (canedit ? '<i class="material-icons">add</i>':'')
        instcont.innerHTML += resource.instances.map(inst => `<div class='instance' id='${inst.id}'>${inst.description || '[no description]'}</div>`).join('') || '[no instances]'
        elm.appendChild(instcont)
    
        document.querySelector('.resource-instances>i').addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Create Instance',
                description: `Create new instance for ${resource.name}`,
                button: 'CREATE',
                inputs: [{ placeholder: 'Description' }]
            })
    
            d.on('complete', async dat => {
                let not = Notif('Creating...', 'autorenew')
                const res = await api.post(`/resources/${resource.id}/instances`, { description: dat.values[1] })
                
                if (!res.err) {
                    window.setTimeout(() => {
                        not.remove()
                        dcache.resources.splice(dcache.resources.findIndex(r => r.id === resource.id), 1)
                        Handler.go('/resources/' + resource.id + '/instances/' + res.id)
                    }, 10)
                } else {
                    console.error(res)
                    not.setText('An error occurred creating this instance')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })
    
            d.show()
        })
    }

    let attcont = document.createElement('div')
    attcont.className = 'resource-attachments'
    attcont.innerHTML = '<h3>Attachments</h3>' + (canedit ? '<i class="material-icons">add</i>':'')
    attcont.innerHTML += resource.attachments.map(att => `<img class='attachment' id='${att.id}' src='${att.url}'>`).join('') || '[no attachments]'
    elm.appendChild(attcont)

    document.querySelector('.resource-attachments>i').addEventListener('click', () => {
        let d = new Dialog('input', {
            title: 'Create Attachment',
            description: `Create new attachment for ${resource.name}`,
            button: 'CREATE',
            inputs: [{ placeholder: 'URL', required: true }, { placeholder: 'Description' }],
            other: `<input type='checkbox' value='cover' name='cv' id='467' ignoreval><label for='467'> Cover Image</label>`,
            execs: ["document.querySelector('[name=cv]').checked ? 'true':'false'"]
        })

        d.on('complete', async dat => {
            let not = Notif('Creating...', 'autorenew')
            const res = await api.post(`/resources/${resource.id}/attachments`, { url: dat.values[0], description: dat.values[1], iscover: (dat.values[2] === 'true') ? true:false })
            
            if (!res.err) {
                window.setTimeout(() => {
                    not.remove()
                    dcache.resources.splice(dcache.resources.findIndex(r => r.id === resource.id), 1)
                    Handler.go('/resources/' + resource.id + '/attachments/' + res.id)
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

    document.querySelectorAll('.instance').forEach(el => el.addEventListener('click', e => Handler.go(`/resources/${resource.id}/instances/${e.target.id}`)))
    document.querySelectorAll('.attachment').forEach(el => el.addEventListener('click', e => Handler.go(`/resources/${resource.id}/attachments/${e.target.id}`)))
    elm.querySelector('span.return').addEventListener('click', () => Handler.go('/resources'))

    window.dispatchEvent(new Event('SPAloaded'))

})()