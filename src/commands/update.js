
const updater = require("automatic-updates")
const command = {
  name: 'update',
  alias: 'u',
  description: 'Update csycms',
  run: async toolbox => {
    console.log(updater)
    // await toolbox.sysUpdate();
  }
}

module.exports = command