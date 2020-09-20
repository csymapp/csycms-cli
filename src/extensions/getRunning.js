const to = require("await-to-js").to

module.exports = toolbox => {
  let description = `csycms site --getrunning  -n <site name> Get all ports on which site is being served.`
  toolbox.getRunning = async (print = false, immediate, siteName) => {
    return new Promise(async (resolve, reject) => {
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
      config.action = 'running'
      let [err, care] = await to(toolbox.sendUDP(config, immediate))
      if (err) return reject(err)
      resolve(care)
    })
  }
}