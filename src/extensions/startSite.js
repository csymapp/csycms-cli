const to = require("await-to-js").to

module.exports = toolbox => {
  let description = `csycms site --start  -n <site name> -p <PORT> -u <Update interval in seconds>. Don\'t use in development.\n\tIf port is not supplied, it uses the port in config file`
  toolbox.startSite = async (print = false, immediate = false) => {
    if (!toolbox.parameters.options.n) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n
    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let config = { siteName };
    if (toolbox.parameters.options.p) {
      config.PORT = toolbox.parameters.options.p
    }
    if (toolbox.parameters.options.u) {
      let interval = toolbox.parameters.options.u;
      if (
        isNaN(parseInt(interval)) ||
        parseInt(interval).toString().length !== interval.toString().length
      ) {
        return toolbox.print.error('-u requires a number!')
      }
      config.update = parseInt(toolbox.parameters.options.u)
    } else {
      config.update = false
    }
    config.action = 'start'
    await to(toolbox.sendUDP(config, immediate))
  }
}