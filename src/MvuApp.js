#!/usr/bin/env node

var gitHandler = require('./utils/GitHandler.js')
var Logger = require('./utils/Logger.js')
var ErrorHandler = require('./utils/ErrorHandler.js')
var Core = require('./MvuCore.js')
var program = require('commander')
var pjson = require('../package.json')
var path = require('path')
var ora = require('ora')

program
  .version(pjson.version)
  .option('-w, --workingDirectory [workingDirectory]', 'Set the working directory', process.cwd())
  .option('-d, --debug', 'Set debug mode instead of info', false)

program
  .command('show-variables')
  .alias('sv')
  .description('show the variables usable in config file')
  .action(function (env, options) {
    Logger.info('\nThe following variables can be used in the config file:\n')
    Logger.info(Core.getPrettyConfigurationVariables())
  })

program
  .command('init')
  .alias('in')
  .description('create a configuration file for the current project')
  .action(function (env, options) {
    Core.createConfig(path.resolve(program.workingDirectory))
  })

program
  .command('patch')
  .alias('p')
  .description('increments the patch version and does the upgrade')
  .action(function (env, options) {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'patch')
  })

program
  .command('minor')
  .alias('mi')
  .description('increments the minor version and does the upgrade')
  .action(function (env, options) {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'minor')
  })

program
  .command('major')
  .alias('ma')
  .description('increments the major version and does the upgrade')
  .action(function (env, options) {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'major')
  })

program.parse(process.argv)

Logger.setLevel(program.debug ? 'debug' : 'info')

if (process.argv.length < 3) {
  program.help()
}

process.on('uncaughtException', ErrorHandler.simpleErrorHandler)

process.on('unhandledRejection', reason => {
  ErrorHandler.simpleErrorHandler(reason)
  if (Core.shouldRevertRepository()) {
    var spinner = ora()
    spinner.start('Reverting changes')
    try {
      gitHandler.revertRepository(true)
    } catch (e) {
      spinner.fail()
    }
    spinner.succeed()
  }
})
