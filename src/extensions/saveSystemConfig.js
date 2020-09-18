const yaml = require('js-yaml');

let defaultConfig = {
  sshKey: `~/.ssh/id_rsa`
}

module.exports = toolbox => {
  toolbox.saveSystemConfig = async (siteName, config = false) => {
    if (!config) {
      config = defaultConfig
    }
    let extendedConfig = JSON.parse(JSON.stringify(defaultConfig));
    for (let i in config) {
      extendedConfig[i] = config[i]
    }
    toolbox.filesystem.write(`/etc/csycms/config/system.yml`, `${yaml.safeDump(config)}`);
    return true;
  }
}