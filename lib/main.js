'use babel'

import {CompositeDisposable} from 'atom'
import {Gorename} from './gorename'

export default {
  golangconfig: null,
  subscriptions: null,
  dependenciesInstalled: null,
  toolRegistered: null,

  activate () {
    this.gorename = new Gorename(
      () => { return this.getGoconfig() },
      () => { return this.getGoget() }
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
    this.dependenciesInstalled = null
    this.toolRegistered = null
  },

  getGoconfig () {
    if (this.goconfig) {
      return this.goconfig
    }
    return false
  },

  consumeGoconfig (service) {
    this.goconfig = service
  },

  getGoget () {
    if (this.goget) {
      return this.goget
    }
    return false
  },

  consumeGoget (service) {
    this.goget = service
    this.registerTool()
  },

  registerTool () {
    if (this.toolRegistered || !this.goget) {
      return
    }
    this.subscriptions.add(this.goget.register('golang.org/x/tools/cmd/gorename'))
    this.toolRegistered = true
  }
}
