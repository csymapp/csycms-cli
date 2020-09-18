const shell = require('shelljs');
const { default: to } = require('await-to-js');

module.exports = toolbox => {
  let description = `csycms site --enable  -n "site name"`
  toolbox.enableSite = async (print = true) => {
    if (
      !toolbox.parameters.options.n
    ) {
      return toolbox.print.error(description)
    }
    let siteName = toolbox.parameters.options.n
    let siteExists = await toolbox.siteExists(false, siteName);
    if (!siteExists) {
      if (print) { toolbox.print.error(`${siteName} does not exist!`) }
      return false
    }
    if (siteExists[0] === true) {
      if (print) { toolbox.print.error(`${siteName} is enabled!`) }
      return
    }
    shell.exec(`ln -s /etc/csycms/sites-available/${siteName}.yml /etc/csycms/sites-enabled/${siteName}.yml`)
    if (print) {
      toolbox.print.success(`${siteName} has been enabled.`)
    }
  }
}