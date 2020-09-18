const shell = require('shelljs')

module.exports = toolbox => {
  let description = `csycms site --delete  -n <site name>`
  toolbox.deleteSite = async (print = false) => {
    if (
      !toolbox.parameters.options.n) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let siteEnabled = siteExists[0];
    if (siteEnabled) {
      await toolbox.disableSite(false);
    }
    shell.exec(`rm -rf /var/www/html/csycms/${siteName}`)
    shell.exec(`rm -rf /etc/csycms/sites-available/${siteName}.yml`)
    
    toolbox.print.success(`${siteName} removed.`)
  }
}