// add your CLI-specific functionality here, which will then be accessible
// to your commands
const fs = require('fs-extra');
const yaml = require('js-yaml')
const to = require('await-to-js').to

// const shell = require('shelljs')
// const path = require('path')
// const packageJson = require(path.join(__dirname, '../..', 'package.json'))

module.exports = toolbox => {
  toolbox.listSites = async (print = false) => {
    let availableSitesFiles = toolbox.filesystem.list('/etc/csycms/sites-available').filter(item => item.slice(-4) !== '.swp')
    let enabledSitesFiles = toolbox.filesystem.list('/etc/csycms/sites-enabled')
    // console.log(availableSitesFiles)
    // console.log(enabledSitesFiles)

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


    // care.push(['Enabled', 'Name', 'PORT', 'Domain', 'Repo']);
    // console.log('ppppppppppppppppp')
    // console.log(care)
    let fields = { "fields": ['Enabled', 'PORT', 'Domain', 'Documentation', 'Repo'] }
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
    // console.log('ppppppppppppppppp')
    // console.log(fields)
    // fields["site1"] = [0, 1]
    // fields["site2"] = [0, 1]
    // console.table([fields, {"enabled":[0,1]},{"DIS":[1,2]}])
    if (print) {
      console.table(fields)
    }

    return retFields
  }
}