const yaml = require('js-yaml');

let defaultConfig = {
  PORT: 0,
  domain: 'localhost',
  documentation: true,
  repo: ''
}

module.exports = toolbox => {
  toolbox.saveConfig = async (siteName, config = false) => {
    if (!config) {
      config = defaultConfig
    }
    let extendedConfig = JSON.parse(JSON.stringify(defaultConfig));
    for (let i in config) {
      extendedConfig[i] = config[i]
    }
    toolbox.filesystem.write(`/etc/csycms/sites-available/${siteName}.yml`, `${yaml.safeDump(extendedConfig)}`);
    return true;
  }
}