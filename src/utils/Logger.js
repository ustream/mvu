'use strict'

var winston = require('winston')

class Logger {
  constructor () {
    this.logger = new winston.Logger({
      transports: [
        new (winston.transports.Console)({
          showLevel: false,
          colorize: 'all',
          level: 'info'
        })
      ]
    })
  }

  info (msg) {
    this.logger.info(msg)
  }

  warn (msg) {
    this.logger.warn(msg)
  }

  error (msg) {
    this.logger.error(msg)
  }

  verbose (msg) {
    this.logger.log('verbose', msg)
  }

  debug (msg) {
    this.logger.debug(msg)
  }

  setLevel (level) {
    this.logger.level = level
  }
}

const instance = new Logger()

module.exports = instance
