const to = require("await-to-js").to

module.exports = toolbox => {
  let description = `csycms site --stopsiteservers  -n <site name>`
  toolbox.stopSiteServers = async (print = false, immediate = false, siteName) => {
    if (!siteName) {
      if (!toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      siteName = toolbox.parameters.options.n
    }
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let [err, care] = await to(toolbox.getRunning(false, true, siteName))
    let runningSitePorts = []
    if (!err) {
      runningSitePorts = care
    }
    console.log(runningSitePorts)
    let stopSiteServers = async (siteIdentifier) => {
      console.log(siteIdentifier)
      let site = siteIdentifier.replace(/:[0-9]*$/, '')
      let port = siteIdentifier.replace(site, '').replace(":", '')
      console.log(site,':::::::::::',port)
      await toolbox.stopSite(false, true, site, port)
    }
    await Promise.all(runningSitePorts.map(stopSiteServers))
  }
}