(() => {

    const clearListeners = elm => {
        let cl = elm.cloneNode(true)
        elm.parentElement.replaceChild(cl, elm)
    }

    class Dialog {
        constructor(type, data) {
            this.elm = document.querySelector('#dialogs>.dialog.' + type)
            if (!this.elm) throw new Error('Invalid Dialog type')
            this.type = type
            this.data = data
            this.callbacks = {}
        }
        render() {
            if (this.type === 'input') {
                this.elm.querySelectorAll('input').forEach(inp => inp.parentElement.removeChild(inp))

                this.elm.querySelector('h3').innerText = this.data.title
                this.elm.querySelector('p').innerText = this.data.description
                this.elm.querySelector('button').innerText = this.data.button || 'SUBMIT'

                clearListeners(this.elm.querySelector('button'))
                this.elm.querySelector('button').addEventListener('click', () => {
                    this.dismiss(false)
                    this.callback('complete', { values: Array.prototype.slice.call(this.elm.querySelectorAll('input')).map(el => el.value) })
                })

                this.data.inputs.forEach(indat => {
                    let inp = document.createElement('input')
                    inp.value = indat.value || ''
                    inp.type = indat.type || 'text'
                    inp.placeholder = indat.placeholder || ''
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
    }

    window.Dialog = Dialog

})()