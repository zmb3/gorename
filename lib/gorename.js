'use babel'

import path from 'path'
import {CompositeDisposable, Point} from 'atom'
import {RenameDialog} from './rename-dialog'

class Gorename {
  constructor (goconfigFunc) {
    this.goconfig = goconfigFunc
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

    let info = Gorename.wordAndOffset(editor)
    let dialog = new RenameDialog(info.word, (newName) => {
      Gorename.saveAllEditors()
      let file = editor.getBuffer().getPath()
      let cwd = path.dirname(file)
      this.runGorename(file, info.offset, cwd, newName)
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

  static wordAndOffset (editor) {
    let cursor = editor.getLastCursor()
    let range = cursor.getCurrentWordBufferRange()
    let middle = new Point(range.start.row,
      Math.floor((range.start.column + range.end.column) / 2))
    let charOffset = editor.buffer.characterIndexForPosition(middle)
    let text = editor.getText().substring(0, charOffset)
    return {word: editor.getTextInBufferRange(range), offset: Buffer.byteLength(text, 'utf8')}
  }

  runGorename (file, offset, cwd, newName) {
    let config = this.goconfig()
    let args = ['-offset', `${file}:#${offset}`, '-to', newName]
    config.executor.exec('gorename', args, {cwd: cwd}).then((r) => {
      if (r.stderr && r.stderr.trim() !== '') {
        if (r.exitcode === 0) {
          atom.notifications.addSuccess(r.stderr.trim())
        } else {
          atom.notifications.addWarning('Rename Error', {
            detail: r.stderr.trim(),
            dismissable: true
          })
        }
      }
    })
  }

  dispose () {
    this.subscriptions.dispose()
    this.subscriptions = null
  }
}

export {Gorename}
