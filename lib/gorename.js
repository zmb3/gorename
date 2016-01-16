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
      () => this.commandInvoked())
    )
  }

  commandInvoked () {
    let editor = atom.workspace.getActiveTextEditor()
    if (!this.isValidEditor(editor)) {
      return
    }

    let info = this.wordAndOffset(editor)
    let dialog = new RenameDialog(info.word, (newName) => {
      this.saveAllEditors()
      let file = editor.getBuffer().getPath()
      let cwd = path.dirname(file)
      this.runGorename(file, info.offset, cwd, newName)
    })
    dialog.attach()
  }

  saveAllEditors () {
    for (let editor of atom.workspace.getTextEditors()) {
      if (editor.isModified() && this.isValidEditor(editor)) {
        editor.save()
      }
    }
  }

  isValidEditor (editor) {
    if (!editor) {
      return false
    }

    let grammar = editor.getGrammar()
    if (!grammar || grammar.scopeName !== 'source.go') {
      return false
    }

    return true
  }

  wordAndOffset (editor) {
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
    if (!config || !config.executor) {
      return {success: false, result: null}
    }
    let args = ['-offset', `${file}:#${offset}`, '-to', newName]
    return config.executor.exec('gorename', args, {cwd: cwd}).then((r) => {
      if (r.error) {
        if (r.error.code === 'ENOENT') {
          atom.notifications.addError('Missing Rename Tool', {
            detail: 'The gorename tool is required to perform a rename. Please run go get -u golang.org/x/tools/cmd/gorename to get it.',
            dismissable: true
          })
        } else {
          atom.notifications.addError('Rename Error', {
            detail: r.error.message,
            dismissable: true
          })
        }
        return {success: false, result: r}
      }

      let message = r.stderr.trim() + '\r\n' + r.stdout.trim()

      if (r.exitcode !== 0) {
        atom.notifications.addWarning('Rename Error', {
          detail: message.trim(),
          dismissable: true
        })
        return {success: false, result: r}
      }

      atom.notifications.addSuccess(message.trim())
      return {success: true, result: r}
    })
  }

  dispose () {
    this.subscriptions.dispose()
    this.subscriptions = null
    this.goconfig = null
  }
}

export {Gorename}
