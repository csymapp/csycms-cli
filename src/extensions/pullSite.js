// const to = require('await-to-js').to
const shell = require('shelljs')

module.exports = toolbox => {
  let description = `csycms site --pull -n <site name>`
  toolbox.pullSite = async (print = false) => {

    if (
      !toolbox.parameters.options.n
    ) {
      return toolbox.print.error(description)
    }
    const siteName = toolbox.parameters.options.n

    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
      toolbox.print.error(`${siteName} does not exist!`)
      return
    }
    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    shell.exec(`cd /var/www/html/csycms/${siteName} && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git pull origin master`)

  }
}