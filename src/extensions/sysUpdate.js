// add your CLI-specific functionality here, which will then be accessible
// to your commands
const service = require('service-systemd');
const shell = require('shelljs')
const path = require('path')
const packageJson = require(path.join(__dirname, '../..', 'package.json'))

module.exports = toolbox => {
  toolbox.sysUpdate = async () => {
    let installedVersion = packageJson.version
    let installedVersionDotted = installedVersion
    installedVersion = installedVersion.replace(/\./g, '')
    try {
      let latestVersion = await shell.exec(`npm show ${packageJson.name} version`, { silent: true }).stdout.replace(/\n/, '')
      let latestVersionDotted = latestVersion
      latestVersion = latestVersion.replace(/\./g, '');

      while (installedVersion.length < latestVersion.length) {
        installedVersion = `${installedVersion}0`
      }
      while (latestVersion.length < installedVersion.length) {
        latestVersion = `${latestVersion}0`
      }
      if (parseInt(latestVersion) > parseInt(installedVersion)) {
        console.log(`Updating from install v${installedVersionDotted} to latest v${latestVersionDotted}`)
        shell.exec(`npm install -g ${packageJson.name}`)
      } else {
        console.log(`Installed v${installedVersionDotted} is the latest.`)
      }
    } catch (error) {
      console.log(error)
    }
  }

}