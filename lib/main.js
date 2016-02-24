'use babel'

import {CompositeDisposable} from 'atom'
import {Gorename} from './gorename'

export default {
  goconfig: null,
  goget: null,
  subscriptions: null,
  dependenciesInstalled: null,

  activate () {
    this.gorename = new Gorename(
      () => { return this.getGoconfig() },
      () => { return this.getGoget() },
    )
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
    this.goget = null
    this.dependenciesInstalled = null
  },

  getGoconfig () {
    if (this.goconfig) {
      return this.goconfig
    }
    return false
  },

  getGoget () {
    if (this.goget) {
      return this.goget
    }
    return false
  },

  consumeGoconfig (service) {
    this.goconfig = service
  },

  consumeGoGet (service) {
    this.goget = service
    if (this.gorename) {
      this.gorename.checkForTool()
    }
  }
}
