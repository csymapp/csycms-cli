const to = require('await-to-js').to

module.exports = toolbox => {
  let description = `csycms site --exists  -n "site name"`
  toolbox.siteExists = async (print = false, siteNamePassed = false) => {
    if (!siteNamePassed) {
      if (
        !toolbox.parameters.options.n
      ) {
        return toolbox.print.error(description)
      }
    }
    let siteName = ''
    if(siteNamePassed === false){
      siteName = toolbox.parameters.options.n
    }else {
      siteName = siteNamePassed
    }
    let [err, care] = await to(toolbox.listSites())
    if (err) {
      return toolbox.print.error(err)
    }
    let sites = JSON.parse(JSON.stringify(care))
    sites = Object.keys(sites);
    // sites.shift()
    let siteExists = sites.includes(siteName)
    if (print) {
      if (!siteExists) {
        toolbox.print.success(`${siteName} does not exist`)
      } else {
        toolbox.print.success(care[siteName])
      }
    }
    if(siteExists){
      siteExists = care[siteName]
    }
    return siteExists
  }
}