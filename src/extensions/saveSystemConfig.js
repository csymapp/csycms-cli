const yaml = require('js-yaml');

let defaultConfig = {
  sshKey: `~/.ssh/id_rsa`,
  PORT: 2121,
  update: 86400
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