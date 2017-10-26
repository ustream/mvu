var fs = require('fs')
var path = require('path')
var ora = require('ora')

const spinner = ora()

class ConfigUpdater {
  constructor (configFiles) {
    this.shortName = ''
    this.configFiles = configFiles
    this.getNewVersionLine = (line, version) => {
      let oldVersion = this.versionLinePattern.exec(line)[1]
      return line.replace(oldVersion, version)
    }
    this.getVersionLine = (line) => this.versionLinePattern.exec(line) != null
  }

  updateConfigFiles (newVersion, workingDirectory) {
    for (let configFileName of Object.keys(this.configFiles)) {
      // Logger.info(`Updating ${this.shortName} config file ${configFileName}... \r`)
      spinner.start(`Updating ${this.shortName} config file: ${configFileName}`)
      let configFilePath = path.resolve(workingDirectory, this.configFiles[configFileName])
      if (!fs.existsSync(configFilePath)) {
        let message = `${configFilePath} does not exist.`
        throw new Error(message)
      }
      let rawConfig = fs.readFileSync(configFilePath, 'utf8')
      let configLines = rawConfig.split('\n')
      let targetLine = configLines.filter(this.getVersionLine)[0]
      let targetIndex = configLines.indexOf(targetLine)
      configLines[targetIndex] = this.getNewVersionLine(targetLine, newVersion)

      fs.writeFileSync(configFilePath, configLines.join('\n'), 'utf8')
      // Logger.info(`Updating ${this.shortName} config file ${configFileName}... done.`)
      spinner.succeed()
    }
    return this.configFiles
  }
}

class NpmUpdater extends ConfigUpdater {
  constructor (configFiles) {
    super(configFiles)
    this.shortName = 'Npm'
    this.versionLinePattern = /.*"version":\s?['"]?([a-zA-Z\d.]*)['"]?.*/g
  }
}

class YarnUpdater extends NpmUpdater {}

class GradleUpdater extends ConfigUpdater {
  constructor (configFiles) {
    super(configFiles)
    this.shortName = 'Gradle'
    this.versionLinePattern = /.*version=\s?['"]?([a-zA-Z\d.]*)['"]?.*/g
  }
}

class HelmUpdater extends ConfigUpdater {
  constructor (configFiles) {
    super(configFiles)
    this.shortName = 'Helm'
    this.versionLinePattern = /.*version:\s?['"]?([a-zA-Z\d.]*)['"]?.*/g
  }
}

class SetuptoolsUpdater extends ConfigUpdater {
  constructor (configFiles) {
    super(configFiles)
    this.shortName = 'Setuptools'
    this.versionLinePattern = /.*version=\s?['"]?([a-zA-Z\d.]*)['"]?.*/g
  }
}

class LeiningenUpdater extends ConfigUpdater {
  constructor (configFiles) {
    super(configFiles)
    this.shortName = 'Leiningen'
    this.versionLinePattern = /.*\(defproject .* \s?['"]?([a-zA-Z\d.]*)['"]?.*/g
  }
}

class CustomUpdater extends ConfigUpdater {
  constructor (configFiles, regex) {
    super(configFiles)
    this.shortName = 'Custom'
    if (regex === '') {
      throw new Error('Custom regex cannot be empty string.')
    }
    this.versionLinePattern = new RegExp(regex)
  }
}

class ConfigUpdaterFactory {
  constructor () {
    this.updaterTypes = {
      'npm': {
        'Type': NpmUpdater,
        'ConfigFiles': ['package.json', 'npm-shrinkwrap.json']
      },
      'leiningen': {
        'Type': LeiningenUpdater,
        'ConfigFiles': ['project.clj']
      },
      'gradle': {
        'Type': GradleUpdater,
        'ConfigFiles': ['gradle.properties']
      },
      'helm': {
        'Type': HelmUpdater,
        'ConfigFiles': ['Chart.yaml']
      },
      'setuptools': {
        'Type': SetuptoolsUpdater,
        'ConfigFiles': ['setup.py']
      },
      'yarn': {
        'Type': YarnUpdater,
        'ConfigFiles': ['package.json']
      }
    }
  }

  getConfigFiles (technologyName) {
    if (this.updaterTypes[technologyName] === undefined) {
      let message = `Not known technology: ${technologyName}`
      throw new Error(message)
    }
    return this.updaterTypes[technologyName].ConfigFiles
  }

  create (name, configFiles, regex = '') {
    name = name.toLowerCase()
    if (Object.keys(this.updaterTypes).includes(name)) {
      return new this.updaterTypes[name].Type(configFiles)
    } else if (name === 'custom') {
      return new CustomUpdater(configFiles, regex)
    } else {
      let message = `Not known technology: ${name}`
      throw new Error(message)
    }
  }
}

module.exports = {
  ConfigUpdaterFactory: ConfigUpdaterFactory
}
