const chalk = require('chalk');
const figlet = require('figlet');

const command = {
  name: 'run',
  description: 'Run your application',
  run: async toolbox => {
    // return new Promise(async (resolve, reject) => {
    console.log(
      chalk.cyan(figlet.textSync('csycms run', { horizontalLayout: 'full' }))
    )
    await toolbox.run();
  }
}

module.exports = command
