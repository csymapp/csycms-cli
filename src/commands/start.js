const shell = require('shelljs')

const command = {
  name: 'start',
  description: 'The same as csycms init with the exception that it does not recreate csycms.service',
  run: async toolbox => {
    await toolbox.init(false);
  }
}

module.exports = command
