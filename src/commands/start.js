const shell = require('shelljs')

const command = {
  name: 'start',
  description: 'Runs systemctl start csycms',
  run: async toolbox => {
    // await toolbox.init(false);
    shell.exec(`systemctl start csycms`)
  }
}

module.exports = command
