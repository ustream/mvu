this.getNewVersion = async (version, level) => {
  let versionRegexp = /(\d+)\.(\d+)\.(\d+)/g
  let match = versionRegexp.exec(version)
  let major = parseInt(match[1])
  let minor = parseInt(match[2])
  let patch = parseInt(match[3])
  switch (level) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}
