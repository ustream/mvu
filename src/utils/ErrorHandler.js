var Logger = require('./Logger.js')

this.simpleErrorHandlerWithResult = (err, result) => {
  this.simpleErrorHandler(err)
}

this.simpleErrorHandler = (err) => {
  if (err != null) {
    Logger.error(err.message)
    Logger.debug(err.stack)
  }
}

this.simplePromiseRejectHandler = (reason, p) => {
  if (p != null) {
    Logger.error(reason)
    Logger.debug(p)
  }
}
