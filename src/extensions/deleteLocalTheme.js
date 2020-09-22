const { to } = require('await-to-js')
const shell = require('shelljs')
const fs = require("fs-extra")

module.exports = toolbox => {
  toolbox.deleteLocalTheme = async (print = false, themeName) => {
    let description = `csycms theme --deletelocal  -n <theme name>`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    let [err, care] = await to(toolbox.listThemesLocal(false))
    if (err) {
      // throw err
      print ? toolbox.print.error(err) : false
      return false;
    }
    if (!Object.keys(care).includes(themeName)) {
      print ? toolbox.print.error(`${themeName} theme does not exist`) : false
      return false;
    }
    toolbox.filesystem.remove(`/var/www/html/csycms/themes/${themeName}`);
    print ? toolbox.print.success(`${themeName} theme removed.`) : false;
  }

  toolbox.themeExists = async (print = false, themeName) => {
    let description = `csycms theme --exists  -n <theme name>`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    let [err, care] = await to(toolbox.listThemes(false))
    if (err) {
      print ? toolbox.print.error(err) : false
      return false;
    }
    if (!Object.keys(care).includes(themeName)) {
      print ? toolbox.print.error(`${themeName} theme does not exist`) : false
      return false
    }
    let tmp = {}
    tmp[themeName] = care[themeName]
    print ? console.table(tmp) : false;
    return tmp
  }

  toolbox.deleteTheme = async (print = false, themeName) => {
    let description = `csycms theme --delete  -n <theme name> Remove from index`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    let [err, care] = await to(toolbox.themeExists(false, themeName))
    if (err) {
      print ? toolbox.print.error(err) : false
      return false;
    }
    if (!care) {
      print ? toolbox.print.error(`${themeName} theme seeems not to exist.`) : false
      return false;
    }

    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    toolbox.filesystem.remove('/tmp/csycms/themes')
    toolbox.filesystem.dir('/tmp/csycms')
    const themeUrl = 'git@github.com:csymapp/csymapp-themes-index.git'
    shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${themeUrl} /tmp/csycms/themes`)

    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('/tmp/csycms/themes/themes.json')
    const db = low(adapter)

    db.unset(themeName).write()
    shell.exec(`cd /tmp/csycms/themes && git add . && git commit -m "removed ${themeName}" && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)
    return true
  }

  toolbox.addTheme = async (print = false, themeName, themeUrltoAdd) => {
    let description = `csycms theme --add  -n <theme name> -u <theme url> Add to index`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    } if (!themeUrltoAdd) {
      if (
        !toolbox.parameters.options.u) {
        return toolbox.print.error(description)
      }
      themeUrltoAdd = toolbox.parameters.options.u
    }
    let [err, care] = await to(toolbox.themeExists(false, themeName))
    if (err) {
      print ? toolbox.print.error(err) : false
      return false;
    }
    if (care) {
      print ? toolbox.print.error(`${themeName} theme already exists!`) : false
      return false;
    }

    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    toolbox.filesystem.remove('/tmp/csycms/themes')
    toolbox.filesystem.dir('/tmp/csycms')
    const themeUrl = 'git@github.com:csymapp/csymapp-themes-index.git'
    shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${themeUrl} /tmp/csycms/themes`)

    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('/tmp/csycms/themes/themes.json')
    const db = low(adapter)

    db.set(themeName, themeUrltoAdd).write()
    shell.exec(`cd /tmp/csycms/themes && git add . && git commit -m "added ${themeName}" && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)
    return true
  }

  toolbox.createLocalTheme = async (print = false, themeName, themeUrltoAdd) => {
    let description = `csycms theme --createlocal  -n <theme name>`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    let [err, care] = await to(toolbox.themeExists(false, themeName))
    if (err) {
      print ? toolbox.print.error(err) : false
      return false;
    }
    if (care) {
      print ? toolbox.print.error(`${themeName} theme already exists!`) : false
      return false;
    }

    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    toolbox.filesystem.remove('/tmp/csycms/themes')
    toolbox.filesystem.dir('/tmp/csycms')
    const themeUrl = 'git@github.com:csymapp/theme-template.git'
    let create = await shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${themeUrl} /var/www/html/csycms/themes/${themeName}`)

    if (create.stderr.length > 0 && create.stderr.includes('fatal:')) {
      print ? toolbox.print.error(create.stderr) : false
      return false
    }
    shell.exec(`cd /var/www/html/csycms/themes/${themeName} && rm -rf .git`)
    print ? toolbox.print.success(`${themeName} theme has been created from template`) : false
    return true
  }

  toolbox.themeExistsLocal = async (print = false, themeName) => {
    let description = `csycms theme --existslocal  -n <theme name>`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    let localThemes = await toolbox.listThemesLocal(false, themeName);
    let exists = Object.keys(localThemes).includes(themeName)
    if (!exists) {
      print ? toolbox.print.error(`${themeName} does not exist`) : false
      return false
    }
    let tmp = {}
    tmp[themeName] = localThemes[themeName]
    print ? console.table(tmp) : false
    return tmp
  }

  toolbox.copyThemeLocal = async (print = false, themeName, destination) => {
    let description = `csycms theme --copylocal  -n <theme name> -d <destination> [-f overwrite existing directory]`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    if (!destination) {
      if (
        !toolbox.parameters.options.d) {
        return toolbox.print.error(description)
      }
      destination = toolbox.parameters.options.d
    }
    let themeExistsSource = await toolbox.themeExistsLocal(false, themeName);
    if (!themeExistsSource) {
      print ? toolbox.print.error(`${themeName} either does not exist or does not exist on local machine. Please check with:\n\tcsycms theme --exists -n ${themeName}\nand\n\tcsycms theme --existslocal -n ${themeName}`) : false
      return false
    }
    let themeExistsDestination = await toolbox.themeExists(false, destination);
    if (themeExistsDestination) {
      print ? toolbox.print.error(`${destination} already exists. Please use a different name. Get existing themes using \n\tcsycms theme --list`) : false
      return false
    }
    let dirExists = fs.existsSync(`/var/www/html/csycms/themes/${destination}`)
    if (dirExists && !toolbox.parameters.options.f) {
      print ? toolbox.print.error(`${destination} directory already exists in /var/www/html/csycms/themes/. Please delete the directory, or choose a different name, or use -f to overwrite`) : false
      return false
    }
    if (toolbox.parameters.options.f) {
      toolbox.filesystem.remove(`/var/www/html/csycms/themes/${destination}`)
    }
    await shell.exec(`cp -r /var/www/html/csycms/themes/${themeName} /var/www/html/csycms/themes/${destination}`)
    await toolbox.themeRemote(false, { themeName: destination, remoteName: 'origin', remove: true })
    print ? toolbox.print.success(`${themeName} has been copied to ${destination}`) : false
    return true;
  }

  toolbox.pushTheme = async (print = false, themeName, message) => {
    let description = `csycms theme --push  -n <theme name> -m <message>`
    if (!themeName) {
      if (
        !toolbox.parameters.options.n) {
        return toolbox.print.error(description)
      }
      themeName = toolbox.parameters.options.n
    }
    if (!message) {
      if (
        !toolbox.parameters.options.m) {
        return toolbox.print.error(description)
      }
      message = toolbox.parameters.options.m
    }
    let dirExists = fs.existsSync(`/var/www/html/csycms/themes/${themeName}`)
    if (!dirExists) {
      print ? toolbox.print.error(`${themeName} theme directory not found`) : false
      return false
    }

    let remoteExists = shell.exec(`cd /var/www/html/csycms/themes/${themeName} && git remote -v`, { silent: true })
    if (remoteExists.stdout.length === 0 && remoteExists.stderr.length === 0 || remoteExists.stderr.includes("fatal:")) {
      remoteExists = false
    }

    if (!remoteExists) {
      let themeExists = await toolbox.themeExists(false, themeName);
      remoteExists = themeExists
      if (!remoteExists) {
        print ? toolbox.print.error(`no git remote has been found for ${themeName} theme. Please add one using:\n\tcsycms theme --remote --add -n ${themeName} -N origin -u <url>`) : false
        return false
      } else {
        await toolbox.themeRemote(false, { themeName, remoteName: 'origin', remoteUrl: remoteExists[themeName], add: true })
      }
    }

    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    shell.exec(`cd /var/www/html/csycms/themes/${themeName} && git add . && git commit -m "${message}" && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git push origin master`)
  }

  toolbox.themeRemote = async (print = false, rqAction = {}) => {
    let description = 'csycms theme --remote -n <theme name>\n\t--add -N <name> -u <url>\n\t--remove -N <name>\n\t-v equivalent to git remote -v'
    let { themeName, remoteName, remoteUrl, add, view, remove } = rqAction;
    if (!themeName) {
      themeName = toolbox.parameters.options.n
    }
    if (!remoteName) {
      remoteName = toolbox.parameters.options.N
    }
    if (!remoteUrl) {
      remoteUrl = toolbox.parameters.options.u
    }
    if (!view) {
      view = toolbox.parameters.options.v || toolbox.parameters.options.view
    }
    if (!add) {
      add = toolbox.parameters.options.add
    }
    if (!remove) {
      remove = toolbox.parameters.options.remove
    }
    if (
      !themeName ||
      (remove ? !remoteName : false) ||
      (add ? (!remoteName || !remoteUrl) : false)
    ) {
      toolbox.print.error(description)
      return false
    }

    let action = ''
    if (remove) {
      action = 'remove'
    }
    if (add) {
      if (action === 'remove') {
        print ? toolbox.print.error(description) : false
        return false
      }
      action = 'add'
      if (!remoteUrl) {
        print ? toolbox.print.error(description) : false
        return false
      }
    }
    if (view) {
      if (action !== '') {
        print ? toolbox.print.error(description) : false
        return false
      }
      action = 'view'
    }

    let result = {};
    switch (action) {
      case 'add':
        result = shell.exec(`cd /var/www/html/csycms/themes/${themeName} && git init && git remote add ${remoteName} ${remoteUrl}`, { silent: !print })
        if (result.stderr.length > 0) {
          return print ? toolbox.print.error(result.stderr) : false
        }
        print ? toolbox.print.success(`${remoteName} added to ${themeName}`) : false
        break;
      case 'remove':
        result = shell.exec(`cd /var/www/html/csycms/themes/${themeName} && git remote rm ${remoteName}`, { silent: !print })
        if (result.stderr.length > 0) {
          return print ? toolbox.print.error(result.stderr) : false
        }
        print ? toolbox.print.success(`${remoteName} removed from ${themeName}`) : false
        break;
      case 'view':
        result = shell.exec(`cd /var/www/html/csycms/themes/${themeName} && git remote -v`, { silent: !print })
        if (result.stderr.length > 0) {
          return print ? toolbox.print.error(result.stderr) : false
        } if (result.stdout.length > 0) {
          return print ? toolbox.print.error(result.stderr) : false
        }
        break;
      default:
        toolbox.print.error(description);
        return false
    }
    return true
  }
}