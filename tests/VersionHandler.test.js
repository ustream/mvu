/* eslint-env mocha */

var chai = require('chai')
var assert = chai.assert
var VersionHandler = require('./../src/utils/VersionHandler.js')

describe('VersionHandler', () => {
  describe('getNewVersion', () => {
    it('Patch level should update the 3rd digit', async () => {
      assert.equal(await VersionHandler.getNewVersion('1.2.3', 'patch'), '1.2.4')
    })
    it('Minor level should update the 2nc digit and zero the 3rd', async () => {
      assert.equal(await VersionHandler.getNewVersion('1.2.3', 'minor'), '1.3.0')
    })
    it('Major level should update the 1st digit zero the 2nd and 3rd', async () => {
      assert.equal(await VersionHandler.getNewVersion('1.2.3', 'major'), '2.0.0')
    })
  })
})
