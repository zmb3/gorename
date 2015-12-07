'use babel'

import {CompositeDisposable} from 'atom'

class RenameDialog {
      constructor (identifier, callback) {
        this.callback = callback
        this.element = document.createElement('div')
        this.element.classList.add('gorename')

        this.subscriptions = new CompositeDisposable()
        this.subscriptions.add(atom.commands.add(this.element, 'core:cancel', () => this.cancel()))
        this.subscriptions.add(atom.commands.add(this.element, 'core:confirm', () => this.confirm()))

        let message = document.createElement('div')
        message.textContent = `Rename ${identifier} to:`
        message.style.padding = '1em'
        this.element.appendChild(message)

        this.input = document.createElement('atom-text-editor')
        this.input.setAttribute('mini', true)
        this.element.appendChild(this.input)
      }

      attach () {
        this.panel = atom.workspace.addModalPanel({
          item: this.element
        })
        this.input.focus()
      }

      cancel () {
        this.close()
      }

      confirm () {
        let newName = this.input.getModel().getText()
        this.close()
        this.callback(newName)
      }

      close () {
        this.subscriptions.dispose()
        this.element.remove()

        let panel = this.panel
        this.panel = null
        panel.destroy()
      }
}

export {RenameDialog}
