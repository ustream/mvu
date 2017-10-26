var inquirer = require('inquirer')
var Logger = require('./utils/Logger.js')
var fs = require('fs')
var path = require('path')

var configUpdaterFactory = new (require('./ConfigUpdaterFactory.js').ConfigUpdaterFactory)()

var defaultConfigName = 'mvu.json'
var obsoleteConfigName = 'phlox.json'

var configurationVariables = {
  'newVersion': 'the version after modification',
  'currentVersion': 'the version before modification'
}

let technologySelection = [
  {
    type: 'checkbox',
    message: 'Select technologies',
    name: 'technologies',
    choices: [
      new inquirer.Separator(' = Buildtools = '),
      { name: 'Gradle' },
      { name: 'Setuptools' },
      { name: 'Npm' },
      { name: 'Leiningen' },
      { name: 'Yarn' },
      new inquirer.Separator(' = Misc tools = '),
      { name: 'Helm' }
    ],
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must choose at least one technology.'
      }
      return true
    }
  }
]

var configPathQuestion = [
  {
    type: 'input',
    name: 'filePath',
    message: 'TO_FILL',
    default: function () {
      return null
    }
  }
]

var configQuestions = [
  {
    type: 'input',
    name: 'currentVersion',
    message: 'What\'s the current version?',
    default: function () {
      return '1.0.0'
    }
  },
  {
    type: 'input',
    name: 'createCommit',
    message: 'Should the config changes be commited?',
    default: function () {
      return true
    }
  },
  {
    type: 'input',
    name: 'createTag',
    message: 'Should a tag be created?',
    default: function () {
      return true
    }
  },
  {
    type: 'input',
    name: 'tagPattern',
    message: 'How should the tag look?',
    default: function () {
      return 'release-{newVersion}'
    }
  },
  {
    type: 'input',
    name: 'commitMessage',
    message: 'How should the commit message look?',
    default: function () {
      return 'Bump version: {currentVersion} → {newVersion}'
    }
  }
]

class MvuConfig {
  constructor (projectConfig) {
    this.currentVersion = projectConfig['currentVersion']
    configurationVariables['currentVersion'] = this.currentVersion
    this.createCommit = projectConfig['createCommit'] || projectConfig['commit']
    this.createTag = projectConfig['createTag'] || projectConfig['tagCreation']
    this.commitMessage = projectConfig['commitMessage']
    this.tagPattern = projectConfig['tagPattern']
    this.technologies = projectConfig['technologies']
    this.updateIfNeeded()
  }

  async updateVersion (newVersion) {
    this.currentVersion = newVersion
    configurationVariables['newVersion'] = newVersion
  }

  async getCommitMessage () {
    return resolveVariables(this.commitMessage)
  }

  async getTag () {
    return resolveVariables(this.tagPattern)
  }

  updateIfNeeded () {
    for (let tech in this.technologies) {
      if ((typeof this.technologies[tech]) !== 'object') {
        let oldValue = this.technologies[tech]
        this.technologies[tech] = {}
        this.technologies[tech]['configFiles'] = {}
        this.technologies[tech]['configFiles'][oldValue] = oldValue
      }
    }
  }

  async save (configPath) {
    fs.writeFileSync(path.resolve(configPath, defaultConfigName), JSON.stringify(this, null, '  ', 'utf8'))
  }
}

async function prepareQuestion (tech, config) {
  let customizedConfigPathQuestion = JSON.parse(JSON.stringify(configPathQuestion.slice()))
  customizedConfigPathQuestion[0]['message'] = `(${tech}) Where is the file '${config}' located?`
  customizedConfigPathQuestion[0]['default'] = () => {
    return config
  }
  return customizedConfigPathQuestion[0]
}

this.createConfig = async (configPath) => {
  let configDict = {}
  let configFullPath = path.resolve(configPath, defaultConfigName)
  inquirer.prompt(configQuestions).then(async (answers) => {
    configDict = answers
    inquirer.prompt(technologySelection).then(async (answers) => {
      configDict['technologies'] = {}
      let result = getPathForTechs(configDict, answers)
      writeConfig(await result, configFullPath)
    })
  })
}

this.buildConfig = async (configPath) => {
  let projectConfig = {}
  let configFullPath = path.resolve(configPath, defaultConfigName)

  // convert old configuration file if present
  if (fs.existsSync(path.resolve(configPath, obsoleteConfigName))) {
    fs.renameSync(path.resolve(configPath, obsoleteConfigName), configFullPath)
  }

  if (fs.existsSync(configFullPath)) {
    let configData = fs.readFileSync(configFullPath, 'utf8')
    try {
      projectConfig = JSON.parse(configData)
    } catch (e) {
      throw Error(`The mvu.json file is corrupt: \n ${e.message}`)
    }
  } else {
    throw new Error('There is no config for the actual project. Please run \'mvu init\'')
  }
  return new MvuConfig(projectConfig)
}

async function getPathForTechs (configDict, answers) {
  for (let tech of Object.values(answers)[0]) {
    configDict['technologies'][tech] = {}
    configDict['technologies'][tech]['configFiles'] = {}
    for (let config of configUpdaterFactory.getConfigFiles(tech.toLowerCase())) {
      let pathQuestion = await prepareQuestion(tech, config)
      let result = await getPathForTech(pathQuestion)
      configDict['technologies'][tech]['configFiles'][config] = result
    }
  }
  return new Promise(function (resolve, reject) {
    resolve(configDict)
  })
}

async function getPathForTech (customizedConfigPathQuestion) {
  let result = await inquirer.prompt(customizedConfigPathQuestion)
  return new Promise(async (resolve, reject) => {
    resolve(result['filePath'])
  })
}

function writeConfig (configDict, configPath) {
  fs.writeFileSync(configPath, JSON.stringify(configDict, null, '  '))
  Logger.info(`Configuration file created (${configPath})`)
  Logger.info('Please commit this file into version control!')
}

async function resolveVariables (stringToResolve) {
  let variableRegex = /(\{[a-zA-Z]*\})/g
  let result = stringToResolve
  let match = null
  while ((match = variableRegex.exec(stringToResolve)) != null) {
    let element = match[0]
    let strippedElement = element.replace('{', '').replace('}', '')
    if (configurationVariables[strippedElement] == null) {
      throw new Error(`Unknown variable: ${strippedElement}`)
    }
    result = result.replace(element, configurationVariables[strippedElement])
  }
  return result
}

module.exports = {
  createConfig: this.createConfig,
  buildConfig: this.buildConfig,
  configurationVariables: configurationVariables,
  MvuConfig: MvuConfig,
  resolveVariables: resolveVariables
}
