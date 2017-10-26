var simpleGit = require('simple-git')
var map = Array.prototype.map

this.repoLocation = __dirname

this.status = async () => {
  let result = null
  return new Promise(async (resolve, reject) => {
    await simpleGit(this.repoLocation).status(function (err, status) {
      if (err != null) {
        reject(err)
      }
      result = map.call(status['files'], function (file) {
        return file['path']
      })
      resolve(result)
    })
  })
}

this.getCurrentBranch = async () => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(this.repoLocation).branch(function (err, summary) {
      if (err != null) {
        throw err
      }

      resolve(summary['current'])
    })
  })
}

// todo: handle remote name properly
this.pushToRemote = async (elementToPush) => {
  let repository = simpleGit(this.repoLocation).silent(true)
  return new Promise(async (resolve, reject) => {
    await repository.push(['origin', elementToPush], function (err, result) {
      if (err != null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

this.pushBranch = async (branch) => {
  return this.pushToRemote(branch)
}

this.pushTag = async (tag) => {
  await this.pushToRemote(tag)
}

this.createTag = async (tagName, message = '') => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(this.repoLocation).addTag(tagName, function (err, result) {
      if (err != null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

this.createCommit = async (message = '', filesToAdd = []) => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(this.repoLocation).add('./*').commit(message, function (err, result) {
      if (err != null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

this.revertRepository = async (hard = true) => {
  let mode = hard ? '--hard' : '--soft'
  return new Promise(async (resolve, reject) => {
    await simpleGit(this.repoLocation).reset([mode], function (err, result) {
      if (err != null) {
        reject(err)
      }
      resolve(result)
    })
  })
}
