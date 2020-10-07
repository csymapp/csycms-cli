// const to = require('await-to-js').to
const shell = require('shelljs')
const path = require('path')
const fs = require('fs-extra')

module.exports = toolbox => {
  let description = `csycms theme --pull -n <theme name. Optional. All themes pulled if missing.> Install or update theme`
  toolbox.pullTheme = async (print = false, themeName) => {
    let themes = await toolbox.listThemes(false);
    let themestoPull = [];
    if (toolbox.parameters.options.n) {
      themeName = toolbox.parameters.options.n
    }
    if (themeName) {
      if (!Object.keys(themes).includes(themeName)) {
        return toolbox.print.error(`${themeName} theme does not exist`);
      }
      let tmp = {}
      tmp[themeName] = themes[themeName]
      themestoPull.push(tmp)
    } else {
      for (themeName in themes) {
        let tmp = {}
        tmp[themeName] = themes[themeName]
        themestoPull.push(tmp)
      }
    }

    const pullTheme = async themeData => {
      let themeName;
      let themeUrl;
      for (let i in themeData) {
        themeName = i;
        themeUrl = themeData[themeName]
        break;
      }

      let key = await toolbox.readSystemConfig()
      key = key.sshKey

      let themesDir = `/var/www/html/csycms/themes/`
      let themeDir = path.join(themesDir, themeName)
      let dirExists = fs.existsSync(themeDir)

      if (!dirExists) {
        shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${themeUrl} ${themeDir}`)
      } else {
        shell.exec(`cd ${themeDir} && GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git pull origin master`)
      }
    }
    await Promise.all(themestoPull.map(pullTheme))
    
    if(print){
      toolbox.print.success('Pulled themes')
    }
  }
}