'use babel'

import {CompositeDisposable} from 'atom'

export default {
  golangconfig: null,
  subscriptions: null,
  dependenciesInstalled: null,

  activate () {
    this.subscriptions = new CompositeDisposable()
    require('atom-package-deps').install('gorename').then(() => {
      this.dependenciesInstalled = true
    }).catch((e) => {
      console.log(e)
    })
  },

  deactivate () {
    if (this.subscriptions) {
      this.subscriptions.dispose()
    }
    this.subscriptions = null
    this.goconfig = null
    this.dependenciesInstalled = null
  },

  getGoconfig () {
    if (this.goconfig) {
      return this.goconfig
    }
    return false
  },

  consumeGoconfig (service) {
    this.goconfig = service
  }
}
