const fs = require('fs-extra')


module.exports = toolbox => {
  toolbox.fixMissingSiteDir = async (print = false, siteName, config = {}) => {
    /**  not implemented. Fixing git clone error in createSite seems to have eliminated the need for this.*/
    return
    if (!config.update) {
      return false
    }
    if (!siteName) {
      if (
        !toolbox.parameters.options.n
      ) {
        return toolbox.print.error(description)
      }
      siteName = toolbox.parameters.options.n
    }

    let siteExists = await toolbox.siteExists(false, siteName);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let dirExists = fs.existsSync(`/var/www/html/csycms/${siteName}`)
    if (!dirExists) {
      let key = await toolbox.readSystemConfig()
      key = key.sshKey
      let remoteUrl = 'https://github.com/csymapp/site-template.git'
      let siteConfig = await toolbox.readSiteConfig(false, siteName)
      if (siteConfig.repo) {
        remoteUrl = config.repo
      }
      await shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${remoteUrl} /var/www/html/csycms/${siteName}`)
      await toolbox.disableSite(false);
      await toolbox.saveConfig(siteName, config)
      await toolbox.enableSite(false);
    }
    try {

    } catch (error) {

    }
    console.log(siteExists)
  }
}