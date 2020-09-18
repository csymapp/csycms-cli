const yaml = require('js-yaml');
const fs = require('fs-extra')

module.exports = toolbox => {
  toolbox.readSystemConfig = async () => {
    let savedConfigs = fs.readFileSync(
      `/etc/csycms/config/system.yml`,
      'utf-8'
    )
    let yamlObject = {}
    try {
      yamlObject = yaml.safeLoad(savedConfigs)
    } catch (err) {
      console.log(err)
    }
    return yamlObject
  }
}