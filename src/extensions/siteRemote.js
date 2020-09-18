// const to = require('await-to-js').to
const shell = require('shelljs')

module.exports = toolbox => {
  let description = `csycms site --remote -n <site name>\n\t--add -N <name> -u <url>\n\t--remove -N <name>\n\t-v equivalent to git remote -v`
  toolbox.siteRemote = async (print = false) => {

    if (
      !toolbox.parameters.options.n ||
      (toolbox.parameters.options.v ? false : !toolbox.parameters.options.N)
    ) {
      return toolbox.print.error(description)
    }
    let action = ''
    let remoteName = ''
    let remoteUrl = ''
    const siteName = toolbox.parameters.options.n

    let siteExists = await toolbox.siteExists(false);
    if (!siteExists) {
        return print?toolbox.print.error(`site ${siteName} does not exist!`):false
    }

    if (toolbox.parameters.options.remove) {
      action = 'remove'
    }
    if (toolbox.parameters.options.add) {
      if (action === 'remove') {
        return print?toolbox.print.error(description):false
      }
      action = 'add'
      if (!toolbox.parameters.options.u) {
        return tprint?oolbox.print.error(description):false
      }
    }
    if (toolbox.parameters.options.v) {
      if (action !== '') {
        return print?toolbox.print.error(description):false
      }
      action = 'view'
    }
    remoteName = toolbox.parameters.options.N
    remoteUrl = toolbox.parameters.options.u
    let result = {};
    switch (action) {
      case 'add':
        result = shell.exec(`cd /var/www/html/csycms/${siteName} && git remote add ${remoteName} ${remoteUrl}`, { silent: !print })
        if (result.stderr.length > 0) {
          return print?toolbox.print.error(result.stderr):false
        }
        print?toolbox.print.success(`${remoteName} added to ${siteName}`):false
        break;
      case 'remove':
        result = shell.exec(`cd /var/www/html/csycms/${siteName} && git remote rm ${remoteName}`, { silent: !print })
        if (result.stderr.length > 0) {
          return print?toolbox.print.error(result.stderr):false
        }
        print?toolbox.print.success(`${remoteName} removed from ${siteName}`):false
        break;
      case 'view':
        result = shell.exec(`cd /var/www/html/csycms/${siteName} && git remote -v`, { silent: !print })
        if (result.stderr.length > 0) {
          return print?toolbox.print.error(result.stderr):false
        }
        break;
    }
  }
}