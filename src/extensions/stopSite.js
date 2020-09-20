const to = require("await-to-js").to

module.exports = toolbox => {
  let description = `csycms site --stop  -n <site name> -p <PORT> If port is not supplied, it uses the port in config file`
  toolbox.stopSite = async (print = false, immediate = false, siteName, port) => {
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
    let config = { siteName };
    if (!port) {
      if (toolbox.parameters.options.p) {
        port = toolbox.parameters.options.p
      }
      // else {
      //   if (port) {
      //     config.PORT = port
      //   }
      // }
    }
    if (port) {
      config.PORT = port
    }

    config.action = 'stop'
    await to(toolbox.sendUDP(config, immediate))
  }
}