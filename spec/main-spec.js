'use babel'
/* eslint-env jasmine */

describe('gorename', () => {
  let mainModule = null

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage('go-config').then(() => {
        return atom.packages.activatePackage('gorename')
      }).then((pack) => {
        mainModule = pack.mainModule
      })
    })

    waitsFor(() => {
      return mainModule.getGoconfig() !== false
    })
  })

  describe('when the gorename package is activated', () => {
    it('activates successfully', () => {
      expect(mainModule).toBeDefined()
      expect(mainModule).toBeTruthy()
      expect(mainModule.getGoconfig).toBeDefined()
      expect(mainModule.consumeGoconfig).toBeDefined()
      expect(mainModule.getGoconfig()).toBeTruthy()
    })
  })
})
