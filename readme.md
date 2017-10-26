## Prerequisite

* node >= 7.6.0

## How to install via npm

```js
npm install -g mass-version-updater
```

## Usage

```
  Options:

    -V, --version            output the version number
    -w, --workdir [workdir]  Set the working directory
    -h, --help               output usage information


  Commands:

    show-variables|sv   show the variables usable in config file
    init|in             create a configuration file for the current project
    patch|p             increments the patch version and does the upgrade
    minor|mi            increments the minor version and does the upgrade
    major|ma            increments the major version and does the upgrade
```

## Configuration file 

You can create the configuration file via `mvu init`. The `mvu.json` should be commited into the repository.

