/* eslint-env mocha */

var Logger = require('../../src/utils/Logger')
var winston = require('winston')
var sinon = require('sinon')
var assert = require('chai').assert

let loggerStub = null

describe('Logger', () => {
  beforeEach(() => {
    loggerStub = sinon.stub(new winston.Logger())
    Logger.logger = loggerStub
  })
  describe('info', () => {
    it('calls the used logger solution with info', () => {
      Logger.info('testMessage')
      sinon.assert.calledWithExactly(loggerStub.info, 'testMessage')
    })
  })
  describe('warn', () => {
    it('calls the used logger solution with warn', () => {
      Logger.warn('testMessage')
      sinon.assert.calledWithExactly(loggerStub.warn, 'testMessage')
    })
  })
  describe('error', () => {
    it('calls the used logger solution with error', () => {
      Logger.error('testMessage')
      sinon.assert.calledWithExactly(loggerStub.error, 'testMessage')
    })
  })
  describe('verbose', () => {
    it('calls the used logger solution with verbose', () => {
      Logger.verbose('testMessage')
      sinon.assert.calledWithExactly(loggerStub.log, 'verbose', 'testMessage')
    })
  })
  describe('debug', () => {
    it('calls the used logger solution with debug', () => {
      Logger.debug('testMessage')
      sinon.assert.calledWithExactly(loggerStub.debug, 'testMessage')
    })
  })
  describe('setLevel', () => {
    it('sets the used logger solutions logging level', () => {
      Logger.setLevel('debug')
      assert(loggerStub.level === 'debug')
    })
  })
})
