// const to = require('await-to-js').to
const shell = require('shelljs')

module.exports = toolbox => {
  let description = `csycms site --sync -n <site name> -m <message>`
  toolbox.syncSite = async (print = false) => {

    if (
      !toolbox.parameters.options.n||
      !toolbox.parameters.options.m
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
    let message = toolbox.parameters.options.m
    shell.exec(`cd /var/www/html/csycms/${siteName} && git add . && git commit -m "${message}" && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)
    shell.exec(`cd /var/www/html/csycms/${siteName} && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)

  }
}