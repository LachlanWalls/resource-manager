(() => {

    window.Notif = (text, type, ar = -1) => {
        let elm = document.createElement('div')
        elm.className = 'notification'
        elm.innerHTML = `<i class='material-icons'>${type}</i><span>${text}</span>`
        document.querySelector('#notifications').appendChild(elm)
        if (ar > -1) window.setTimeout(() => elm.parentElement.removeChild(elm), ar)
        return {
            setText: text => elm.innerHTML = elm.innerHTML.split('<span>')[0] + `<span>${text}</span>`,
            setType: type => elm.innerHTML = `<i class='material-icons'>${type}</i>` + elm.innerHTML.split('</i>')[1],
            remove: () => elm.parentElement.removeChild(elm)
        }
    }

})()