
module.exports = toolbox => {
  let description = `csycms site --restart  -n <site name> -p <PORT> If port is not supplied, it uses the port in config file`
  toolbox.restartSite = async (print = false) => {
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
    config.action = 'restart'
    await toolbox.sendUDP(config)
  }
}