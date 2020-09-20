const fs = require('fs-extra');
const yaml = require('js-yaml')
const to = require('await-to-js').to

module.exports = toolbox => {
  toolbox.listSites = async (print = false) => {
    if (toolbox.parameters.options.n) {
      toolbox.parameters.options.s = true
    }
    let availableSitesFiles = toolbox.filesystem.list('/etc/csycms/sites-available').filter(item => item.slice(-4) !== '.swp')
    let enabledSitesFiles = toolbox.filesystem.list('/etc/csycms/sites-enabled')

    let loadSiteSettings = async (siteName) => {
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
      return [siteName, yamlObject]
    }
    availableSitesFiles = availableSitesFiles.map(item => item.replace(/\.yml$/, ''))
    enabledSitesFiles = enabledSitesFiles.map(item => item.replace(/\.yml$/, ''))
    let promises = availableSitesFiles.map(loadSiteSettings)
    let [err, care] = await to(Promise.all(promises));

    let fields = { "fields": ['Enabled', 'PORT', 'Domain', 'Documentation', 'Repo', 'Update Interval'] }
    let retFields = {}
    // enabled Sites
    care.map(item => {
      let siteName = item[0]
      let yamlObject = item[1]
      let siteEnabled = enabledSitesFiles.includes(siteName) ? true : false
      if (siteEnabled) {
        fields[siteName] = [siteEnabled, ...Object.values(yamlObject)]
        retFields[siteName] = [siteEnabled, ...Object.values(yamlObject)]
      }
    })// Not enabled
    care.map(item => {
      let siteName = item[0]
      let yamlObject = item[1]
      let siteEnabled = enabledSitesFiles.includes(siteName) ? true : false
      if (!siteEnabled) {
        fields[siteName] = [siteEnabled, ...Object.values(yamlObject)]
        retFields[siteName] = [siteEnabled, ...Object.values(yamlObject)]
      }
    })
    let siteCounter = 0;
    if (print) {
      let splitList = toolbox.parameters.options.s
      if (splitList) {
        care.map(item => {
          let siteNametoList = item[0]
          if (!toolbox.parameters.options.n) {
            let siteConfig = item[1]
            siteConfig.Enabled = fields[siteNametoList][0]
            console.log(`#${++siteCounter}`)
            console.log(`SITE: ${siteNametoList}`)
            for (let key in siteConfig) {
              console.log(`${key}:${siteConfig[key]}`)
            }
            console.log('-------------')
          } else {
            console.log(`#${++siteCounter}:${siteNametoList}`)
          }
        })
      } else {
        console.table(fields)
      }
    }

    return retFields
  }
}