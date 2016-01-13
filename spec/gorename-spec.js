'use babel'

import temp from 'temp'
import path from 'path'
import fs from 'fs-plus'

describe('gorename', () => {
  temp.track()
  let mainModule = null
  let gorename = null
  let editor = null
  let gopath = null
  let source = null
  let target = null

  beforeEach(() => {
    runs(() => {
      gopath = temp.mkdirSync('gopath-')
    })

    waitsForPromise(() => {
      return atom.packages.activatePackage('environment').then(() => {
        return atom.packages.activatePackage('go-config')
      }).then(() => {
        return atom.packages.activatePackage('gorename')
      }).then((pack) => {
        mainModule = pack.mainModule
        gorename = mainModule.gorename
      })
    })

    waitsFor(() => {
      return mainModule.getGoconfig() !== false
    })

    runs(() => {
      mainModule.getGoconfig().environment()['GOPATH'] = gopath
    })
  })

  fdescribe('when a simple file is open', () => {
    beforeEach(() => {
      runs(() => {
        source = path.join(__dirname, 'fixtures', 'basic')
        target = path.join(gopath, 'src', 'basic')
        fs.copySync(source, target)
      })

      waitsForPromise(() => {
        return atom.workspace.open(path.join(target, 'main.go')).then((e) => {
          editor = e
        })
      })
    })

    it('renames a single token', () => {
      editor.setCursorScreenPosition([4, 5])
      let info = gorename.wordAndOffset(editor)
      expect(info.word).toBe('foo')
      expect(info.offset).toBe(33)

      let file = editor.getBuffer().getPath()
      let cwd = path.dirname(file)
      let r = false
      waitsForPromise(() => {
        return gorename.runGorename(file, info.offset, cwd, 'bar').then((result) => {
          r = result
        })
      })
      runs(() => {
        expect(r).toBeTruthy()
        expect(r.success).toBe(true)
        expect(r.result.stderr).toBe('')
        let expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'basic-expected', 'main.go'), 'utf8')
        let actual = editor.getText()
        expect(actual).toBe(expected)
      })
    })
  })
})
