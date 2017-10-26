/* eslint-env mocha */

var chai = require('chai')
var assert = chai.assert
var expect = chai.expect
var ConfigUpdaterFactory = require('../src/ConfigUpdaterFactory.js').ConfigUpdaterFactory

describe('ConfigUpdaterFactory', () => {
  describe('create', () => {
    it('should create NpmUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Npm'))
    })
    it('should create YarnUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Yarn'))
    })
    it('should create LeiningenUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Leiningen'))
    })
    it('should create GradleUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Gradle'))
    })
    it('should create HelmUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Helm'))
    })
    it('should create SetuptoolsUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Setuptools'))
    })
    it('should create CustomUpdater', () => {
      assert.isNotNull(new ConfigUpdaterFactory().create('Custom', '', '.*'))
    })
    it('should not create NotDefinedUpdater', () => {
      expect(() => new ConfigUpdaterFactory().create('NotDefinedUpdater')).to.throw('Not known technology')
    })
  })
  describe('customUpdater', () => {
    it('should throw error if regex is empty', () => {
      expect(() => new ConfigUpdaterFactory().create('custom', '', '')).to.throw('Custom regex cannot be empty string.')
    })
    it('parameter regex becomes the versionLinePattern', () => {
      expect(new ConfigUpdaterFactory().create('custom', '', '.*').versionLinePattern.source).to.be.eq(new RegExp('.*').source)
    })
  })
  describe('getConfigFiles', () => {
    it('should give back the correct config file name', () => {
      let result = new ConfigUpdaterFactory().getConfigFiles('npm')
      expect(result).include('package.json').and.include('npm-shrinkwrap.json')
    })
    it('should throw error on not know technology name', () => {
      expect(() => new ConfigUpdaterFactory().getConfigFiles('not-known-tech')).to.throw('Not known technology: not-known-tech')
    })
  })
})
