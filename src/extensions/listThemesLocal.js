const path = require('path')
const to = require('await-to-js').to
const fs = require('fs-extra')

module.exports = toolbox => {
  toolbox.listThemesLocal = async (print = false) => {
    let [err, care] = await to(toolbox.listThemes())
    if (err) {
      if (print) {
        toolbox.print.error(err)
        throw err
      }
    }
    themes = care;
    let localThemes = {};
    let themesDir = `/var/www/html/csycms/themes/`
    for (let themeName in themes) {
      let themeDir = path.join(themesDir, themeName)
      let dirExists = fs.existsSync(themeDir)
      if (dirExists) {
        localThemes[themeName] = themes[themeName]
      }
    }
    if (print) {
      console.table(localThemes)
    }
    return localThemes;
  }
}