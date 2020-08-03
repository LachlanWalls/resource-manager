(() => {

    let elm = window.renderElement

    let h1 = document.createElement('h1')
    h1.innerText = SITENAME

    elm.appendChild(h1)
    
    window.dispatchEvent(new Event('SPAloaded'))

})()