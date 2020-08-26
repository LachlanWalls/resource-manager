(async() => {

    /* resources.js
    - render all resources
    */

    let elm = window.renderElement

    window.dcache.resources = await api.get('/resources')

    let fcont = document.createElement('div')
    fcont.style.textAlign = 'center'

    for (const resource of window.dcache.resources) {
        let cont = document.createElement('div')
        cont.className = 'resource'

        let catts = resource.attachments.filter(a => a.iscover === 1)
        let img = (catts.length > 0) ? `<img src='${catts[0].url}' alt='${catts[0].description}'>`:''

        cont.innerHTML = `${img}<h5>${resource.id}</h5><h1>${resource.name}</h1><p class='inf'>${resource.type === 'singular' ? 'singular':`${resource.instances.length} instances`}</p>`
        if (resource.description) cont.innerHTML += `<p class='desc'>${resource.description}</p>`
        if (resource.tags.length > 0) cont.innerHTML += `<div class='tags'>${resource.tags.map(t => `<div>${t.name}</div>`).join('')}</div>`

        fcont.appendChild(cont)
        cont.addEventListener('click', e => {
            let celm = e.target
            while (celm.className !== 'resource') celm = celm.parentElement
            Handler.go('/resources/' + celm.querySelector('h5').innerText)
        })
    }

    if (permissions.checkPerm(client.permissions, 'MANAGE_RESOURCES')) {
        let add = document.createElement('div')
        add.className = 'add'
        add.innerHTML = '<i class="material-icons">add</i>'
        fcont.appendChild(add)

        add.addEventListener('click', () => {
            let d = new Dialog('input', {
                title: 'Create Resource',
                description: ``,
                button: 'CREATE',
                inputs: [{ placeholder: 'Name', required: true }, { placeholder: 'Description' }],
                other: "<input type='radio' value='singular' name='tp' id='123' checked ignoreval><label for='123'>Singular</label><input type='radio' value='instanced' name='tp' id='124' ignoreval><label for='124'>Instanced</label>",
                execs: ["(() => {const elms = document.querySelectorAll('[name=tp]'); for (const elm of elms) { if (elm.checked) return elm.value }})()"]
            })

            d.on('complete', async dat => {
                let not = Notif('Creating...', 'autorenew')
                const res = await api.post(`/resources`, { name: dat.values[0], description: dat.values[1], type: dat.values[2] })
                
                if (!res.err) {
                    window.setTimeout(() => {
                        not.remove()
                        dcache.resources = []
                        Handler.go('/resources/' + res.id)
                    }, 10)
                } else {
                    console.error(res)
                    not.setText('An error occurred creating this resource')
                    not.setType('error_outline')
                    window.setTimeout(() => not.remove(), 4000)
                }
            })

            d.show()
        })
    }

    elm.appendChild(fcont)
    
    window.dispatchEvent(new Event('SPAloaded'))

})()