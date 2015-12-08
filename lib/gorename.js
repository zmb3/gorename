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
    let editor = atom.workspace.getActiveTextEditor()
    if (editor.getGrammar().scopeName !== 'source.go') {
      return
    }

    let original = Gorename.wordUnderCursor(editor)
    let offset = Gorename.cursorByteOffset(editor)
    let dialog = new RenameDialog(original, (newName) => {
      Gorename.saveAllEditors()
      console.log('gorename -offset ' + editor.buffer.getPath() + ':#' + offset)
    })
    dialog.attach()
  }

  static saveAllEditors () {
    for (let editor of atom.workspace.getTextEditors()) {
      if (editor.isModified() && editor.getGrammar().scopeName === 'source.go') {
        editor.save()
      }
    }
  }

  static wordUnderCursor (editor) {
    let cursor = editor.getLastCursor()
    let range = cursor.getCurrentWordBufferRange()
    return editor.getTextInBufferRange(range)
  }

  // TODO: eventually, we'd like go-config to provide this functionality
  static cursorByteOffset (editor) {
    let pos = editor.getCursorBufferPosition()
    let charOffset = editor.buffer.characterIndexForPosition(pos)
    let text = editor.getText().substring(0, charOffset)
    return Buffer.byteLength(text, 'utf8')
  }

  dispose () {
    this.subscriptions.dispose()
    this.subscriptions = null
  }
}

export {Gorename}
