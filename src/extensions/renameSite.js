const shell = require('shelljs')
// const to = require('await-to-js').to

module.exports = toolbox => {
  let description = `csycms site --rename  -n <site name> -N <new name>`
  toolbox.renameSite = async (print = false) => {
    if (
      !toolbox.parameters.options.n ||
      !toolbox.parameters.options.N
    ) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n
    const newSiteName = toolbox.parameters.options.N
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    if(siteName === newSiteName){
      return toolbox.print.error(`cannot rename ${siteName} to itself`)
    }
    let siteEnabled = siteExists[0];
    if (siteEnabled) {
      await toolbox.disableSite(false);
    }
    shell.exec(`mv /var/www/html/csycms/${siteName} /var/www/html/csycms/${newSiteName}`)
    shell.exec(`mv /etc/csycms/sites-available/${siteName}.yml /etc/csycms/sites-available/${newSiteName}.yml`)
    if (siteEnabled) {
      toolbox.parameters.options.n = newSiteName
      await toolbox.enableSite(false);
    }
    toolbox.print.success(`${siteName} renamed to ${newSiteName}`)
  }
}