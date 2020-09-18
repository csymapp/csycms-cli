const shell = require('shelljs')
const fs = require('fs-extra')

module.exports = toolbox => {
  let description = `csycms site --duplicate  -n <site name> -d <destination>`
  toolbox.copySite = async (print = false) => {
    if (
      !toolbox.parameters.options.n ||
      !toolbox.parameters.options.d
    ) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n
    const newSiteName = toolbox.parameters.options.d
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    if(siteName === newSiteName){
      return toolbox.print.error(`cannot copy  ${siteName} into itself`)
    }
    let siteEnabled = siteExists[0];
    toolbox.parameters.options.n = newSiteName
    let destinationExists = await toolbox.siteExists(false);
    if(destinationExists){
      return toolbox.print.error(`Selected destination site ${newSiteName} already exists`)
    }
    let dirExists = fs.existsSync(`/var/www/html/csycms/${newSiteName}`)
    if (dirExists) {
      let reply = await toolbox.prompt.confirm(`Site directory already exists in /var/www/html/csycms/${newSiteName}. Overwrite?`)
      if (reply === false) {
        return toolbox.print.error(`Site directory already exists in /var/www/html/csycms/${newSiteName}`)
      } else {
        shell.exec(`rm -rf /var/www/html/csycms/${newSiteName}`)
      }
    }
    shell.exec(`cp -r /var/www/html/csycms/${siteName} /var/www/html/csycms/${newSiteName}`)
    shell.exec(`cp -r /etc/csycms/sites-available/${siteName}.yml /etc/csycms/sites-available/${newSiteName}.yml`)
    if (siteEnabled) {
      toolbox.parameters.options.n = newSiteName
      await toolbox.enableSite(false);
    }
    toolbox.print.success(`${siteName} copied to ${newSiteName}. Be sure to edit its configuration file.`)
  }
}