const shell = require('shelljs')

const command = {
  name: 'stop',
  description: 'Runs systemctl stop csycms',
  run: async toolbox => {
    shell.exec('systemctl stop csycms')
  }
}

module.exports = command
