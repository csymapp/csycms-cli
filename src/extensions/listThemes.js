// const axios = require('axios')
// const to = require('await-to-js').to
const shell = require('shelljs')

module.exports = toolbox => {
  toolbox.listThemes = async (print = false) => {
    // let [err, care] = await to(axios.get('https://raw.githubusercontent.com/csymapp/csymapp-themes-index/master/themes.json', headers))
    // if (err) {
    //   throw err
    // }
    // care = care.data;
    // if (print) {
    //   console.table(care)
    // }
    // return care;

    let key = await toolbox.readSystemConfig()
    key = key.sshKey
    toolbox.filesystem.remove('/tmp/csycms/themes')
    toolbox.filesystem.dir('/tmp/csycms')
    const themeUrl = 'git@github.com:csymapp/csymapp-themes-index.git'
    let clone = await shell.exec(`GIT_SSH_COMMAND='ssh -i ${key} -o IdentitiesOnly=yes' git clone ${themeUrl} /tmp/csycms/themes`)
    if(clone.stderr.length  && clone.stderr.includes('fatal:')){
      // print? toolbox.print.err(clone.stderr.length)
      throw clone.stderr.length
    }
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('/tmp/csycms/themes/themes.json')
    const db = low(adapter)

    let care = db.getState();
    if (print) {
      console.table(care)
    }
    return care;

  }
}