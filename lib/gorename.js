'use babel'

import {CompositeDisposable} from 'atom'
import {RenameDialog} from './rename-dialog'

class Gorename {
  constructor () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor', 'gorename:rename',
      () => this.commandInvoked()))
  }

  commandInvoked () {
    let dialog = new RenameDialog('FOO', (newName) => {
      console.log(`renaming to ${newName}`)
    })
    dialog.attach()
  }

  dispose () {
    this.subscriptions.dispose()
    this.subscriptions = null
  }
}

export {Gorename}
