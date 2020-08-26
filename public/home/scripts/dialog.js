(() => {

    const clearListeners = elm => {
        let cl = elm.cloneNode(true)
        elm.parentElement.replaceChild(cl, elm)
    }

    class Dialog {
        constructor(type, data) {
            // create a dialog class
            this.elm = document.querySelector('#dialogs>.dialog.' + type)
            if (!this.elm) throw new Error('Invalid Dialog type')
            this.type = type
            this.data = data
            this.callbacks = {}
        }
        render() {
            if (this.type === 'input') {
                // update all data
                this.elm.querySelectorAll('input').forEach(inp => inp.parentElement.removeChild(inp))

                this.elm.querySelector('h3').innerText = this.data.title
                this.elm.querySelector('p').innerText = this.data.description
                this.elm.querySelector('button').innerText = this.data.button || 'SUBMIT'
                this.elm.querySelector('button').style.backgroundColor = this.data.buttonbg || ''
                this.elm.querySelector('.other').innerHTML = this.data.other || ''

                // clear lsiteners from previous instances
                clearListeners(this.elm.querySelector('button'))

                this.elm.querySelector('button').addEventListener('click', () => {
                    // load basic input values
                    let inputs = Array.prototype.slice.call(this.elm.querySelectorAll('input:not([ignoreval])'))
                    let fails = inputs.filter(inp => inp.getAttribute('required') === '' && !inp.value)
                    if (fails.length > 0) return this.errorfield(fails[0])

                    this.dismiss(false)
                    let vals = inputs.map(el => el.value)

                    // run custom value execs
                    if (!this.data.execs) this.data.execs = []
                    this.data.execs.forEach(ex => {
                        let dat = eval(ex)
                        if (dat) vals.push(dat)
                    })

                    // broadcast completion
                    this.callback('complete', { values: vals })
                })

                // load up inputs
                this.data.inputs.forEach(indat => {
                    let inp = document.createElement('input')
                    inp.value = indat.value || ''
                    inp.type = indat.type || 'text'
                    inp.placeholder = indat.placeholder || ''
                    inp.name = indat.name || ''
                    if (indat.required) inp.setAttribute('required', '')
                    this.elm.insertBefore(inp, this.elm.querySelector('button'))
                })
            }

            clearListeners(this.elm.querySelector('i'))
            clearListeners(document.querySelector('#dialogs>.overlay'))

            this.elm.querySelector('i').addEventListener('click', () => this.dismiss())
            document.querySelector('#dialogs>.overlay').addEventListener('click', () => this.dismiss())
        }
        show() {
            this.render()
            this.elm.removeAttribute('hidden')
            document.querySelector('#dialogs>.overlay').removeAttribute('hidden')
        }
        dismiss(cb = true) {
            if (cb) this.callback('close', {})
            this.elm.setAttribute('hidden', '')
            document.querySelector('#dialogs>.overlay').setAttribute('hidden', '')
        }
        callback(event, data) {
            if (this.callbacks[event]) this.callbacks[event].forEach(cb => cb(data))
        }
        on(event, fn) {
            if (!this.callbacks[event]) this.callbacks[event] = [fn]
            else this.callbacks[event].push(fn)
        }
        errorfield(elm) {
            elm.style.outline = '2px solid #b30202'
            elm.focus()
        }
    }

    window.Dialog = Dialog

})()