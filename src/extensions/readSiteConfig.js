// const to = require('await-to-js').to
// const shell = require('shelljs')
const fs = require("fs-extra")
const yaml = require('js-yaml')

module.exports = toolbox => {
  let description = `csycms site --readconfig -n <site name>`
  toolbox.readSiteConfig = async (print = false, siteName) => {
    if (!siteName) {
      if (!toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      siteName = toolbox.parameters.options.n
      let siteExists = await toolbox.siteExists(false);
      if (!siteExists) {
        toolbox.print.error(`${siteName} does not exist!`)
        return
      }
    }

    let savedConfigs = fs.readFileSync(
      `/etc/csycms/sites-available/${siteName}.yml`,
      'utf-8'
    )
    let yamlObject = {}
    try {
      yamlObject = yaml.safeLoad(savedConfigs)
    } catch (err) {
      console.log(err)
    }
    // console.log(`/etc/csycms/sites-enabled/${siteName}.yml`)
    let siteConfig = toolbox.filesystem.exists(`/etc/csycms/sites-enabled/${siteName}.yml`)
    if (siteConfig) {
      yamlObject.Enabled = true
    } else {
      yamlObject.Enabled = false
    }

    print ? console.table(yamlObject) : false;
    return yamlObject;
  }
}