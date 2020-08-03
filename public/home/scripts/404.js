(() => {

    let elm = window.renderElement

    let h1 = document.createElement('h1')
    h1.innerText = '404 page not found'

    elm.appendChild(h1)

    window.dispatchEvent(new Event('SPAloaded'))

})()