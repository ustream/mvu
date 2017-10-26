/* eslint-env mocha */

var sinon = require('sinon')
var chai = require('chai')
var assert = chai.assert
var ErrorHandler = require('./../../src/utils/ErrorHandler.js')
var Logger = require('../../src/utils/Logger')

var loggerInfoStub = null
var loggerDebugStub = null
var loggerErrorStub = null

describe('ErrorHandler', () => {
  beforeEach(function () {
    loggerInfoStub = sinon.stub(Logger, 'info')
    loggerDebugStub = sinon.stub(Logger, 'debug')
    loggerErrorStub = sinon.stub(Logger, 'error')
  })

  afterEach(function () {
    loggerInfoStub.restore()
    loggerDebugStub.restore()
    loggerErrorStub.restore()
  })

  describe('simpleErrorHandlerWithResult', () => {
    it('should log error message', () => {
      ErrorHandler.simpleErrorHandlerWithResult(new Error('sampleMessage'), 'someresult')
      assert(loggerErrorStub.calledOnce)
    })

    it('should log debug message', () => {
      ErrorHandler.simpleErrorHandlerWithResult(new Error('sampleMessage'), 'someresult')
      assert(loggerDebugStub.calledOnce)
    })

    it('called with null does nothing', () => {
      ErrorHandler.simpleErrorHandlerWithResult(null)
      assert(loggerErrorStub.callCount === 0)
    })
  })

  describe('simpleErrorHandler', () => {
    it('should log error message', () => {
      ErrorHandler.simpleErrorHandler(new Error('sampleMessage'))
      assert(loggerErrorStub.calledOnce)
    })

    it('should log debug message', () => {
      ErrorHandler.simpleErrorHandler(new Error('sampleMessage'))
      assert(loggerDebugStub.calledOnce)
    })

    it('called with null does nothing', () => {
      ErrorHandler.simpleErrorHandler(null)
      assert(loggerErrorStub.callCount === 0)
    })
  })

  describe('simplePromiseRejectHandler', () => {
    it('should log reason as error', () => {
      ErrorHandler.simplePromiseRejectHandler('reason', 'promise')
      assert(loggerErrorStub.calledWith('reason'))
    })

    it('should log promise as debug', () => {
      ErrorHandler.simplePromiseRejectHandler('reason', 'promise')
      assert(loggerDebugStub.calledWith('promise'))
    })

    it('called with null does nothing', () => {
      ErrorHandler.simplePromiseRejectHandler(null)
      assert(loggerErrorStub.callCount === 0)
    })
  })
})
