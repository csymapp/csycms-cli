const shell = require('shelljs');
const { default: to } = require('await-to-js');

module.exports = toolbox => {
  let description = `csycms site --disable  -n "site name"`
  toolbox.disableSite = async (print = true) => {
    if (
      !toolbox.parameters.options.n
    ) {
      return toolbox.print.error(description)
    }
    let siteName = toolbox.parameters.options.n
    let siteExists = await toolbox.siteExists(false, siteName);
    if (!siteExists) {
      if (print) { toolbox.print.error(`${siteName} does not exist!`) }
      shell.exec(`unlink /etc/csycms/sites-enabled/${siteName}.yml`, { silent: true })
      return false
    }
    if (siteExists[0] === false) {
      if (print) { toolbox.print.error(`${siteName} is disabled!`) }
      return false
    }
    await toolbox.stopSiteServers(false, true, siteName);
    shell.exec(`unlink /etc/csycms/sites-enabled/${siteName}.yml`)
    if (print) {
      toolbox.print.success(`${siteName} has been disabled.`)
    }
  }
}