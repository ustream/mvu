var ora = require('ora')
var ConfigBuilder = require('./ConfigBuilder.js')
var gitHandler = require('./utils/GitHandler.js')
var ConfigUpdaterFactory = require('./ConfigUpdaterFactory.js').ConfigUpdaterFactory
var VersionHandler = require('./utils/VersionHandler.js')
var Logger = require('./utils/Logger.js')
var revertRepository = true
const spinner = ora()

async function executeUpgradeStep (stepToExecute, message) {
  spinner.start(message)
  try {
    await stepToExecute()
  } catch (e) {
    spinner.fail()
    Logger.error(e)
    throw e
  }
  spinner.succeed()
}

async function executeUpgrade (workingDirectory, level) {
  gitHandler.repoLocation = workingDirectory
  await checkGitStatus()
  var config = await ConfigBuilder.buildConfig(workingDirectory)
  var newVersion = await VersionHandler.getNewVersion(config.currentVersion, level)
  await config.updateVersion(newVersion)
  config.save(workingDirectory)
  var filesToAdd = []
  filesToAdd = filesToAdd.concat([config.name])
  filesToAdd = filesToAdd.concat(await updateTechnologyConfigs(config, newVersion, workingDirectory))
  if (config.createCommit === true) {
    await executeUpgradeStep(async () => gitHandler.createCommit(await config.getCommitMessage(), filesToAdd), 'Committing changes')
    let tag = await config.getTag()
    if (config.createTag === true) {
      await executeUpgradeStep(async () => gitHandler.createTag(tag), `Creating tag ${tag}`)
    }
    await executeUpgradeStep(async () => gitHandler.pushBranch(await gitHandler.getCurrentBranch()), `Pushing changes`)
    if (config.createTag === true) {
      await executeUpgradeStep(async () => gitHandler.pushTag(tag), `Pushing tags`)
    }
  }
}

async function checkGitStatus () {
  var status = await gitHandler.status()
  if (status.length !== 0) {
    revertRepository = false
    throw new Error('There are uncommited changes in the repository. Please commit or discard them before using Mvu.')
  }
}

async function updateTechnologyConfigs (projectConfig, newVersion, workingDirectory) {
  var results = []
  Object.keys(projectConfig['technologies']).forEach((tech) => {
    let techSection = projectConfig['technologies'][tech]
    var res = new ConfigUpdaterFactory().create(tech, techSection.configFiles, techSection.regex).updateConfigFiles(newVersion, workingDirectory)
    results.push(res)
  })
  return results
}

function createConfig (pathToConfig) {
  ConfigBuilder.createConfig(pathToConfig)
}

function getPrettyConfigurationVariables (variableName = null) {
  let configurationVariables = ConfigBuilder.configurationVariables
  return Object.keys(configurationVariables).map((variable) => `{${variable}} - ${configurationVariables[variable]} `).join('\n')
}

module.exports = {
  shouldRevertRepository: () => { return revertRepository },
  executeUpgrade: executeUpgrade,
  createConfig: createConfig,
  getPrettyConfigurationVariables: getPrettyConfigurationVariables
}
