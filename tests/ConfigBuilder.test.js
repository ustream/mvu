/* eslint-env mocha */

var chai = require('chai')
var assert = chai.assert
var ConfigBuilder = require('./../src/ConfigBuilder.js')

describe('MvuConfig', () => {
  describe('creation', () => {
    it('sets the currentVersion variable', async () => {
      var result = new ConfigBuilder.MvuConfig({
        'currentVersion': '10.20.30',
        'commitMessage': 'commit-{currentVersion}'
      })
      assert.equal(await result.getCommitMessage(), 'commit-10.20.30')
    })
  })
  describe('updateVersion', () => {
    it('newVersion becomes the current version', async () => {
      var result = new ConfigBuilder.MvuConfig({})
      result.updateVersion('new-version')
      assert.equal(await result.currentVersion, 'new-version')
    })
    it('sets the newVersion variable', async () => {
      var result = new ConfigBuilder.MvuConfig({
        'commitMessage': 'commit-{newVersion}'
      })
      result.updateVersion('new-version')
      assert.equal(await result.getCommitMessage(), 'commit-new-version')
    })
  })
  describe('resolveVariables', () => {
    it('can resolve currentVersion', async () => {
      ConfigBuilder.configurationVariables['currentVersion'] = 'testVersion'
      assert.equal(await ConfigBuilder.resolveVariables('test-string-{currentVersion}'), 'test-string-testVersion')
    })
    it('can resolve newVersion', async () => {
      ConfigBuilder.configurationVariables['newVersion'] = 'testVersion'
      assert.equal(await ConfigBuilder.resolveVariables('test-string-{newVersion}'), 'test-string-testVersion')
    })
    it('unknown variable in the string causes error', async () => {
      try {
        await ConfigBuilder.resolveVariables('{notknownvar}')
      } catch (e) {
        assert.equal(e.message, 'Unknown variable: notknownvar')
      }
    })
  })
})
