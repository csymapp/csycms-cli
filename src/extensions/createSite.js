const shell = require('shelljs')
const fs = require("fs-extra")
// const to = require('await-to-js').to

module.exports = toolbox => {
  let description = `csycms site --create -n "site name" -p PORT [-r siteRepository -d sitedomain -D remove documentation]`
  toolbox.createSite = async () => {
    let config = {};
    if (
      !toolbox.parameters.options.n ||
      !toolbox.parameters.options.p
    ) {
      return toolbox.print.error(description)
    }
    if (isNaN(toolbox.parameters.options.p)) {
      return toolbox.print.error('Invalid port supplied')
    }
    config.PORT = toolbox.parameters.options.p
    // if (!toolbox.parameters.options.d) {
    //   toolbox.parameters.options.d = 'localhost'
    // }
    // if (!toolbox.parameters.options.r) {
    //   toolbox.parameters.options.r = ' '
    // } 
    if (toolbox.parameters.options.d) {
      config.domain = toolbox.parameters.options.d
    }
    if (toolbox.parameters.options.r) {
      config.repo = toolbox.parameters.options.r
    }
    if (toolbox.parameters.options.D) {
      config.documentatation = false
    }
    let siteName = toolbox.parameters.options.n;
    let siteExists = await toolbox.siteExists(false, siteName);
    if (siteExists) {
      return toolbox.print.error(`${siteName} already exists!`)
    }
    let dirExists = fs.existsSync(`/var/www/html/csycms/${siteName}`)
    let clone = true;
    if (dirExists) {
      let reply = await toolbox.prompt.confirm(`Site directory already exists in /var/www/html/csycms/${siteName}. Overwrite?`)
      if (reply === false) {
        clone = false;
      } else {
        shell.exec(`rm -rf /var/www/html/csycms/${siteName}`)
      }
    }
    if (clone) {
      let key = await toolbox.readSystemConfig()
      key = key.sshKey
      let remoteUrl = 'https://github.com/csymapp/site-template.git'
      if (config.repo) {
        remoteUrl = config.repo
      }
      await shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${remoteUrl} /var/www/html/csycms/${siteName}`)
    }
    await toolbox.disableSite(false);
    await toolbox.saveConfig(siteName, config)
    await toolbox.enableSite(false);
    if (!config.repo) {
      toolbox.parameters.options.N = 'origin'
      toolbox.parameters.options.remove = true;
      await toolbox.siteRemote(false)
    }
    toolbox.print.success(`Site ${siteName} has been created`)
  }
}