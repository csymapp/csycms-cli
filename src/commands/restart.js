const shell = require('shelljs')

const command = {
  name: 'restart',
  description: 'Runs systemctl restart csycms',
  run: async toolbox => {
    shell.exec('systemctl restart csycms')
  }
}

module.exports = command
